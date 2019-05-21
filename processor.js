const { dynamoDB, route53, cloudfront, s3, codepipeline } = require('./services');
const validate = require('./validate');

const logErr = (stage, err) => { console.log(`Error on ${stage}: `, err) }
const logNonFatalErr = (stage, reason) => { console.log(`Ignoring non-fatal error during ${stage}: ${reason}`) }
const logSuccess = (stage, res) => { console.log(`Successfully completed ${stage}; result: `, res) }

async function callAndLog(stage, promise) {
    try {
        let res = await promise;
        logSuccess(stage, res);
        return res;
    } catch (err) {
        logErr(stage, err);
        throw err;
    }
}

async function processorCreate(dappName) {
    const dbItem = await callAndLog('Get DynamoDB Item', dynamoDB.getItem(dappName));
    let processOp = validate.stateCreate(dbItem);
    if (!processOp) {
        console.log("Ignoring operation 'create'");
        return {};
    }

    let abi = dbItem.Item.Abi.S;
    let addr = dbItem.Item.ContractAddr.S;
    let web3URL = dbItem.Item.Web3URL.S;
    let guardianURL = dbItem.Item.GuardianURL.S;
    let bucketName = dbItem.Item.S3BucketName.S;
    let owner = dbItem.Item.OwnerEmail.S;
    let pipelineName = dbItem.Item.PipelineName.S;
    let dnsName = dbItem.Item.DnsName.S;
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
        let newDistro = await callAndLog('Create Cloudfront Distro', cloudfront.createDistro(dappName, owner, s3Dns, dnsName));

        cloudfrontDistroId = newDistro.Distribution.Id;
        cloudfrontDns = newDistro.Distribution.DomainName;
    } catch (err) {
        switch(err.code) {
            case 'CNAMEAlreadyExists':
                try {
                    let conflictingDistro = await callAndLog('Get Conflicting Cloudfront Distro', cloudfront.getConflictingDistro(dappName, dnsName));
                    await validate.conflictingDistroRepurposable(conflictingDistro, owner);

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

async function processorUpdate(dappName) {
    const dbItem = await callAndLog('Get DynamoDB Item', dynamoDB.getItem(dappName));
    let processOp = validate.stateUpdate(dbItem);
    if (!processOp) {
        console.log("Ignoring operation 'update'");
        return {};
    }

    let abi = dbItem.Item.Abi.S;
    let addr = dbItem.Item.ContractAddr.S;
    let web3URL = dbItem.Item.Web3URL.S;
    let guardianURL = dbItem.Item.GuardianURL.S;
    let cdnURL = dbItem.Item.CloudfrontDnsName.S;

    await callAndLog('Update DappSeed', s3.putDappseed({ dappName, web3URL, guardianURL, abi, addr, cdnURL }));
    await callAndLog('Set DynamoDB item BUILDING_DAPP', dynamoDB.setItemBuilding(dbItem.Item));

    return {};
}

async function processorDelete(dappName) {
    const dbItem = await callAndLog('Get Dapp DynamoDb Item', dynamoDB.getItem(dappName));
    let processOp = validate.stateDelete(dbItem);
    if (!processOp) {
        console.log("Ignoring operation 'delete'");
        return {};
    }

    let bucketName = dbItem.Item.S3BucketName.S;
    let cloudfrontDistroId = dbItem.Item.CloudfrontDistributionId.S;
    let cloudfrontDns = dbItem.Item.CloudfrontDnsName.S;
    let pipelineName = dbItem.Item.PipelineName.S;
    let dnsName = dbItem.Item.DnsName.S;

    let deleteDnsRecordPromise = callAndLog('Delete Route53 Record', route53.deleteRecord(dnsName, cloudfrontDns));
    let deletePipelinePromise = callAndLog('Delete CodePipeline', codepipeline.delete(pipelineName));
    await Promise.all([deleteDnsRecordPromise, deletePipelinePromise]);
        
    try {
        await callAndLog('Disable Cloudfront distro', cloudfront.disableDistro(cloudfrontDistroId));
        await callAndLog('Delete Cloudfront distro', Promise.resolve("TODO: Cloudfront's delete is turned off until we have a working strategy."));
    } catch (err) {
        switch(err.code) {
            case 'NoSuchDistribution':
                logNonFatalErr("Distribution already deleted.")
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
                logNonFatalErr(stage, 'Bucket already deleted.');
                break;
            default:
                throw err;
        }
    }

    await callAndLog('Delete DynamoDB item', dynamoDB.deleteItem(dappName));

    return {};
}

module.exports = {
  create : processorCreate,
  update : processorUpdate,
  delete : processorDelete
}