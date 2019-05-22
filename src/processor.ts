import services from './services';
import { StateValidationError, InternalProcessingError } from './errors';
const { dynamoDB, route53, cloudfront, s3, codepipeline } = services;
import validate from './validate';
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

async function processorCreate(dappName:string) {
    const dbItem = await callAndLog('Get DynamoDB Item', dynamoDB.getItem(dappName));
    
    let processOp = validate.stateCreate(dbItem);
    if (!processOp) {
        console.log("Ignoring operation 'create'");
        return {};
    }

    // Check if the dbItem exists so the compiler knows the object can be referenced below
    if (!dbItem.Item) throw new StateValidationError('Create error: Corresponding DynamoDB record could not be found.');

    let abi = dbItem.Item.Abi.S as string;
    let addr = dbItem.Item.ContractAddr.S as string;
    let web3URL = dbItem.Item.Web3URL.S as string;
    let guardianURL = dbItem.Item.GuardianURL.S as string;
    let bucketName = dbItem.Item.S3BucketName.S as string;
    let owner = dbItem.Item.OwnerEmail.S as string;
    let pipelineName = dbItem.Item.PipelineName.S as string;
    let dnsName = dbItem.Item.DnsName.S as string;
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

    let createPipelinePromise = callAndLog('Create CodePipeline', codepipeline.create(dappName, pipelineName, bucketName, owner));
    let createDnsRecordPromise = callAndLog('Create Route 53 record', route53.createRecord(dnsName, cloudfrontDns));
    await Promise.all([createPipelinePromise, createDnsRecordPromise]);

    await callAndLog('Set DynamoDB item BUILDING_DAPP', dynamoDB.setItemBuilding(dbItem.Item, cloudfrontDistroId, cloudfrontDns));

    return {};
}

async function processorUpdate(dappName:string) {
    const dbItem = await callAndLog('Get DynamoDB Item', dynamoDB.getItem(dappName));
    if (!dbItem.Item) throw new StateValidationError('Update error: Corresponding DynamoDB record could not be found.');
    let processOp = validate.stateUpdate(dbItem);
    if (!processOp) {
        console.log("Ignoring operation 'update'");
        return {};
    }

    let abi = dbItem.Item.Abi.S as string;
    let addr = dbItem.Item.ContractAddr.S as string;
    let web3URL = dbItem.Item.Web3URL.S as string;
    let guardianURL = dbItem.Item.GuardianURL.S as string;
    let cdnURL = dbItem.Item.CloudfrontDnsName.S as string;

    await callAndLog('Update DappSeed', s3.putDappseed({ dappName, web3URL, guardianURL, abi, addr, cdnURL }));
    await callAndLog('Set DynamoDB item BUILDING_DAPP', dynamoDB.setItemBuilding(dbItem.Item));

    return {};
}

async function processorDelete(dappName:string) {
    const dbItem = await callAndLog('Get Dapp DynamoDb Item', dynamoDB.getItem(dappName));
    if (!dbItem.Item) throw new StateValidationError('Delete error: Corresponding DynamoDB record could not be found.');
    let processOp = validate.stateDelete(dbItem);
    if (!processOp) {
        console.log("Ignoring operation 'delete'");
        return {};
    }

    let bucketName = dbItem.Item.S3BucketName.S as string;
    let cloudfrontDistroId = dbItem.Item.CloudfrontDistributionId.S as string;
    let cloudfrontDns = dbItem.Item.CloudfrontDnsName.S as string;
    let pipelineName = dbItem.Item.PipelineName.S as string;
    let dnsName = dbItem.Item.DnsName.S as string;

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

export default {
    create : processorCreate,
    update : processorUpdate,
    delete : processorDelete
}