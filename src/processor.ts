import Dapp from '@eximchain/dappbot-types/spec/dapp';
import services from './services';
import { StateValidationError, InternalProcessingError } from './errors';
const { dynamoDB, route53, cloudfront, s3, codepipeline } = services;
import validate from './validate';
import { AttributeMap } from "aws-sdk/clients/dynamodb";
import { Distribution } from 'aws-sdk/clients/cloudfront';

const logErr = (stage:string, err:any) => { console.log(`Error on ${stage}: `, err) }
const logNonFatalErr = (stage:string, reason:string) => { console.log(`Ignoring non-fatal error during ${stage}: ${reason}`) }
const logSuccess = (stage:string, res:any) => { console.log(`Successfully completed ${stage}; result: `, res) }

async function callAndLog<ReturnType>(stage:string, promise:Promise<ReturnType>) {
    try {
        let res = await promise;
        logSuccess(stage, res);
        return res;
    } catch (err) {
        logErr(stage, err);
        throw err;
    }
}

function createProcessorForTier(tier:string) {
    switch(tier) {
        case Dapp.Tiers.Standard:
            return createStandardDapp;
        case Dapp.Tiers.Professional:
            throw new StateValidationError("PROFESSIONAL tier not yet implemented for 'create'");
        case Dapp.Tiers.Enterprise:
            return createEnterpriseDapp;
        default:
            throw new StateValidationError(`No 'create' processor exists for invalid tier '${tier}'`);
    }   
}

async function processorCreate(dappName:string) {
    const dbItem = await callAndLog('Get DynamoDB Item', dynamoDB.getItem(dappName));

    // Check if the dbItem exists so the compiler knows the object can be referenced below
    if (!dbItem.Item) throw new StateValidationError('Create error: Corresponding DynamoDB record could not be found.');
    
    let processOp = validate.stateCreate(dbItem);
    if (!processOp) {
        console.log("Ignoring operation 'create'");
        return {};
    }

    let tier = dbItem.Item.Tier.S as string;
    let tierProcessor = createProcessorForTier(tier);

    return tierProcessor(dappName, dbItem.Item);
}

async function createLegacyPoc(dappName:string, dappItem:AttributeMap) {
    let abi = dappItem.Abi.S as string;
    let addr = dappItem.ContractAddr.S as string;
    let web3URL = dappItem.Web3URL.S as string;
    let guardianURL = dappItem.GuardianURL.S as string;
    let bucketName = dappItem.S3BucketName.S as string;
    let owner = dappItem.OwnerEmail.S as string;
    let pipelineName = dappItem.PipelineName.S as string;
    let dnsName = dappItem.DnsName.S as string;
    let s3Dns = s3.bucketEndpoint(bucketName);

    await callAndLog('Create S3 Bucket', s3.createBucketWithTags(bucketName, dappName, owner));

    await callAndLog('Set Bucket Readable', s3.setBucketPublic(bucketName));
    await callAndLog('Configure Bucket Website', s3.configureBucketWebsite(bucketName));
    let enableCORSPromise = callAndLog('Enable Bucket CORS', s3.enableBucketCors(bucketName, dnsName));
    let putLoadingPagePromise = callAndLog('Put Loading Page', s3.putLoadingPage(bucketName));

    await Promise.all([enableCORSPromise, putLoadingPagePromise]);

    // Making Cloudfront Distribution first because we now want to incorporate its ID into the
    // dappseed.zip information for use at cleanup time.
    let cloudfrontDistroId, cloudfrontDns;
    try {
        let newDistroResult = await callAndLog('Create Cloudfront Distro', cloudfront.createDistro(dappName, owner, s3Dns, dnsName));
        let newDistro = newDistroResult.Distribution as Distribution;
        cloudfrontDistroId = newDistro.Id;
        cloudfrontDns = newDistro.DomainName;
    } catch (err) {
        switch(err.code) {
            case 'CNAMEAlreadyExists':
                try {
                    let conflictingDistro = await callAndLog('Get Conflicting Cloudfront Distro', cloudfront.getConflictingDistro(dnsName));
                    await validate.conflictingDistroRepurposable(conflictingDistro, owner);

                    // Check if the distro exists so the compiler knows the object can be referenced below
                    if (!conflictingDistro) throw new InternalProcessingError("Got CNAMEAlreadyExists, but no conflicting distributions were found.  Bug!");

                    // Required vars to exit the block without errors
                    cloudfrontDistroId = conflictingDistro.Id;
                    cloudfrontDns = conflictingDistro.DomainName;

                    await callAndLog('Update Cloudfront Origin', cloudfront.updateOriginAndEnable(cloudfrontDistroId, s3Dns));                      
                } catch (err) {
                    logErr("Repurpose existing Cloudfrong Distribution", err);
                    throw err;
                }
                break;
            default:
                logErr("Create Cloudfront Distribution", err);
                throw err;
        }
    }

    await callAndLog('Put DappSeed', s3.putDappseed({ dappName, web3URL, guardianURL, abi, addr, cdnURL: cloudfrontDns }));

    let createPipelinePromise = callAndLog('Create POC CodePipeline', codepipeline.createPocPipeline(dappName, pipelineName, bucketName, owner));
    let createDnsRecordPromise = callAndLog('Create Route 53 record', route53.createRecord(dnsName, cloudfrontDns));
    await Promise.all([createPipelinePromise, createDnsRecordPromise]);

    await callAndLog('Set DynamoDB item BUILDING_DAPP', dynamoDB.setItemBuilding(dappItem, cloudfrontDistroId, cloudfrontDns));

    return {};
}

async function createStandardDapp(dappName:string, dappItem:AttributeMap) {
    await callAndLog('Set DynamoDB item AVAILABLE', dynamoDB.setItemAvailable(dappItem));

    return {};
}

async function createEnterpriseDapp(dappName:string, dappItem:AttributeMap) {
    let abi = dappItem.Abi.S as string;
    let addr = dappItem.ContractAddr.S as string;
    let web3URL = dappItem.Web3URL.S as string;
    let guardianURL = dappItem.GuardianURL.S as string;
    let bucketName = dappItem.S3BucketName.S as string;
    let owner = dappItem.OwnerEmail.S as string;
    let srcPipelineName = dappItem.SrcPipelineName.S as string;
    let buildPipelineName = dappItem.PipelineName.S as string;
    let dnsName = dappItem.DnsName.S as string;
    let targetRepoName = dappItem.TargetRepoName.S as string;
    let targetRepoOwner = dappItem.TargetRepoOwner.S as string;
    let s3Dns = s3.bucketEndpoint(bucketName);

    await callAndLog('Create S3 Bucket', s3.createBucketWithTags(bucketName, dappName, owner));

    await callAndLog('Set Bucket Readable', s3.setBucketPublic(bucketName));
    await callAndLog('Configure Bucket Website', s3.configureBucketWebsite(bucketName));
    let enableCORSPromise = callAndLog('Enable Bucket CORS', s3.enableBucketCors(bucketName, dnsName));
    let putLoadingPagePromise = callAndLog('Put Loading Page', s3.putLoadingPage(bucketName));

    await Promise.all([enableCORSPromise, putLoadingPagePromise]);

    // Making Cloudfront Distribution first because we now want to incorporate its ID into the
    // dappseed.zip information for use at cleanup time.
    let cloudfrontDistroId, cloudfrontDns;
    try {
        let newDistroResult = await callAndLog('Create Cloudfront Distro', cloudfront.createDistro(dappName, owner, s3Dns, dnsName));
        let newDistro = newDistroResult.Distribution as Distribution;
        cloudfrontDistroId = newDistro.Id;
        cloudfrontDns = newDistro.DomainName;
    } catch (err) {
        switch(err.code) {
            case 'CNAMEAlreadyExists':
                try {
                    let conflictingDistro = await callAndLog('Get Conflicting Cloudfront Distro', cloudfront.getConflictingDistro(dnsName));
                    await validate.conflictingDistroRepurposable(conflictingDistro, owner);

                    // Check if the distro exists so the compiler knows the object can be referenced below
                    if (!conflictingDistro) throw new InternalProcessingError("Got CNAMEAlreadyExists, but no conflicting distributions were found.  Bug!");

                    // Required vars to exit the block without errors
                    cloudfrontDistroId = conflictingDistro.Id;
                    cloudfrontDns = conflictingDistro.DomainName;

                    await callAndLog('Update Cloudfront Origin', cloudfront.updateOriginAndEnable(cloudfrontDistroId, s3Dns));                      
                } catch (err) {
                    logErr("Repurpose existing Cloudfrong Distribution", err);
                    throw err;
                }
                break;
            default:
                logErr("Create Cloudfront Distribution", err);
                throw err;
        }
    }

    await callAndLog('Put DappSeed', s3.putDappseed({ dappName, web3URL, guardianURL, abi, addr, cdnURL: cloudfrontDns }));

    let createSrcPipelinePromise = callAndLog('Create Src Enterprise CodePipeline', codepipeline.createEnterpriseSrcPipeline(dappName, srcPipelineName, owner, targetRepoName, targetRepoOwner));
    let createBuildPipelinePromise = callAndLog('Create Build Enterprise CodePipeline', codepipeline.createEnterpriseBuildPipeline(dappName, owner, buildPipelineName, targetRepoName, targetRepoOwner, bucketName));
    let createDnsRecordPromise = callAndLog('Create Route 53 record', route53.createRecord(dnsName, cloudfrontDns));
    await Promise.all([createSrcPipelinePromise, createBuildPipelinePromise, createDnsRecordPromise]);

    await callAndLog('Set DynamoDB item BUILDING_DAPP', dynamoDB.setItemBuilding(dappItem, cloudfrontDistroId, cloudfrontDns));

    return {};
}

function updateProcessorForTier(tier:string | undefined) {
    switch(tier) {
        case Dapp.Tiers.Standard:
            return updateStandardDapp;
        case Dapp.Tiers.Professional:
            throw new StateValidationError("PROFESSIONAL tier not yet implemented for 'update'");
        case Dapp.Tiers.Enterprise:
            return updateEnterpriseDapp;
        default:
            throw new StateValidationError(`No 'update' processor exists for invalid tier '${tier}'`);
    }   
}

async function processorUpdate(dappName:string) {
    const dbItem = await callAndLog('Get DynamoDB Item', dynamoDB.getItem(dappName));

    if (!dbItem.Item) throw new StateValidationError('Update error: Corresponding DynamoDB record could not be found.');

    let processOp = validate.stateUpdate(dbItem);
    if (!processOp) {
        console.log("Ignoring operation 'update'");
        return {};
    }

    let tier = dbItem.Item.Tier.S as string;
    let tierProcessor = updateProcessorForTier(tier);

    return tierProcessor(dappName, dbItem.Item);
}

async function updateLegacyPoc(dappName:string, dappItem:AttributeMap) {
    let abi = dappItem.Abi.S as string;
    let addr = dappItem.ContractAddr.S as string;
    let web3URL = dappItem.Web3URL.S as string;
    let guardianURL = dappItem.GuardianURL.S as string;
    let cdnURL = dappItem.CloudfrontDnsName.S as string;

    await callAndLog('Update DappSeed', s3.putDappseed({ dappName, web3URL, guardianURL, abi, addr, cdnURL }));
    await callAndLog('Set DynamoDB item BUILDING_DAPP', dynamoDB.setItemBuilding(dappItem));

    return {};
}

async function updateStandardDapp(dappName:string, dappItem:AttributeMap) {
    await callAndLog('Set DynamoDB item AVAILABLE', dynamoDB.setItemAvailable(dappItem));

    return {};
}

async function updateEnterpriseDapp(dappName:string, dappItem:AttributeMap) {
    let abi = dappItem.Abi.S as string;
    let addr = dappItem.ContractAddr.S as string;
    let web3URL = dappItem.Web3URL.S as string;
    let guardianURL = dappItem.GuardianURL.S as string;
    let cdnURL = dappItem.CloudfrontDnsName.S as string;

    await callAndLog('Update DappSeed', s3.putDappseed({ dappName, web3URL, guardianURL, abi, addr, cdnURL }));
    await callAndLog('Set DynamoDB item BUILDING_DAPP', dynamoDB.setItemBuilding(dappItem));

    return {};
}

function deleteProcessorForTier(tier:string | undefined) {
    switch(tier) {
        case Dapp.Tiers.Standard:
            return deleteStandardDapp;
        case Dapp.Tiers.Professional:
            throw new StateValidationError("PROFESSIONAL tier not yet implemented for 'delete'");
        case Dapp.Tiers.Enterprise:
            return deleteEnterpriseDapp;
        default:
            throw new StateValidationError(`No 'delete' processor exists for invalid tier '${tier}'`);
    }   
}

async function processorDelete(dappName:string) {
    const dbItem = await callAndLog('Get Dapp DynamoDb Item', dynamoDB.getItem(dappName));

    if (!dbItem.Item) throw new StateValidationError('Delete error: Corresponding DynamoDB record could not be found.');

    let processOp = validate.stateDelete(dbItem);
    if (!processOp) {
        console.log("Ignoring operation 'delete'");
        return {};
    }

    let tier = dbItem.Item.Tier.S as string;
    let tierProcessor = deleteProcessorForTier(tier);

    return tierProcessor(dappName, dbItem.Item);
}

async function deleteLegacyPoc(dappName:string, dappItem:AttributeMap) {
    let bucketName = dappItem.S3BucketName.S as string;
    let cloudfrontDistroId = dappItem.CloudfrontDistributionId.S as string;
    let cloudfrontDns = dappItem.CloudfrontDnsName.S as string;
    let pipelineName = dappItem.PipelineName.S as string;
    let dnsName = dappItem.DnsName.S as string;

    let deleteDnsRecordPromise = callAndLog('Delete Route53 Record', route53.deleteRecord(dnsName, cloudfrontDns));
    let deletePipelinePromise = callAndLog('Delete CodePipeline', codepipeline.delete(pipelineName));
    await Promise.all([deleteDnsRecordPromise, deletePipelinePromise]);
        
    try {
        await callAndLog('Disable Cloudfront distro', cloudfront.disableDistro(cloudfrontDistroId));
        await callAndLog('Delete Cloudfront distro', Promise.resolve("TODO: Cloudfront's delete is turned off until we have a working strategy."));
    } catch (err) {
        switch(err.code) {
            case 'NoSuchDistribution':
                logNonFatalErr('Disable Cloudfront distro', "Distribution already deleted.")
                break;
            default:
                throw err;
        }
    }

    try {
        await callAndLog('Empty S3 Bucket', s3.emptyBucket(bucketName));
        await callAndLog('Delete S3 Bucket', s3.deleteBucket(bucketName));
    } catch (err) {
        switch(err.code) {
            case 'NoSuchBucket':
                logNonFatalErr('Empty S3 Bucket', 'Bucket already deleted.');
                break;
            default:
                throw err;
        }
    }

    await callAndLog('Delete DynamoDB item', dynamoDB.deleteItem(dappName));

    return {};
}

async function deleteStandardDapp(dappName:string, dappItem:AttributeMap) {
    await callAndLog('Delete DynamoDB item', dynamoDB.deleteItem(dappName));

    return {};
}

async function deleteEnterpriseDapp(dappName:string, dappItem:AttributeMap) {
    let bucketName = dappItem.S3BucketName.S as string;
    let cloudfrontDistroId = dappItem.CloudfrontDistributionId.S as string;
    let cloudfrontDns = dappItem.CloudfrontDnsName.S as string;
    let srcPipelineName = dappItem.SrcPipelineName.S as string;
    let buildPipelineName = dappItem.PipelineName.S as string;
    let dnsName = dappItem.DnsName.S as string;

    let deleteDnsRecordPromise = callAndLog('Delete Route53 Record', route53.deleteRecord(dnsName, cloudfrontDns));
    let deleteSrcPipelinePromise = callAndLog('Delete Src CodePipeline', codepipeline.delete(srcPipelineName));
    let deleteBuildPipelinePromise = callAndLog('Delete Build CodePipeline', codepipeline.delete(buildPipelineName));
    await Promise.all([deleteDnsRecordPromise, deleteSrcPipelinePromise, deleteBuildPipelinePromise]);
        
    try {
        await callAndLog('Disable Cloudfront distro', cloudfront.disableDistro(cloudfrontDistroId));
        await callAndLog('Delete Cloudfront distro', Promise.resolve("TODO: Cloudfront's delete is turned off until we have a working strategy."));
    } catch (err) {
        switch(err.code) {
            case 'NoSuchDistribution':
                logNonFatalErr('Disable Cloudfront distro', "Distribution already deleted.")
                break;
            default:
                throw err;
        }
    }

    try {
        await callAndLog('Empty S3 Bucket', s3.emptyBucket(bucketName));
        await callAndLog('Delete S3 Bucket', s3.deleteBucket(bucketName));
    } catch (err) {
        switch(err.code) {
            case 'NoSuchBucket':
                logNonFatalErr('Empty S3 Bucket', 'Bucket already deleted.');
                break;
            default:
                throw err;
        }
    }

    await callAndLog('Delete DynamoDB item', dynamoDB.deleteItem(dappName));

    return {};
}

async function deadLetterFail(dappName:string) {
    await callAndLog('Set DynamoDB Item FAILED', dynamoDB.setDappFailed(dappName));

    return {};
}

async function deadLetterDepose(dappName:string) {
    await callAndLog('Set DynamoDB Item DEPOSED', dynamoDB.setDappDeposed(dappName));

    return {};
}

export default {
    create : processorCreate,
    update : processorUpdate,
    delete : processorDelete,
    fail : deadLetterFail,
    depose : deadLetterDepose
}