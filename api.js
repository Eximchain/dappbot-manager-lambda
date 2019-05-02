const { dynamoDB, route53, cloudfront, s3, codepipeline } = require('./services');
const validate = require('./validate');

const logErr = (stage, err) => { console.log(`Error on ${stage}: `, err) }
const logSafeErr = (stage, reason) => { console.log(`Safe error during ${stage}: ${reason}`) }
const logSuccess = (stage, res) => { console.log(`Successfully completed ${stage}; result: `, res) }

const successResponse = (body) => {
    let responseCode = 200;
    // TODO: Replace with something useful or remove
    let responseHeaders = {"x-custom-header" : "my custom header value"};
    return {
        statusCode: responseCode,
        headers: responseHeaders,
        body: JSON.stringify(body)
    };
}

// Using this factory function lets us create a new "stage" variable
// for each invocation.  Otherwise, `stage` and `callAndLog` function would
// need to be re-declared in each of the functions below.
const callFactory = (startStage) => {
    let stage = startStage;
    const callAndLog = async (newStage, promise) => {
        stage = newStage;
        let res = await promise;
        logSuccess(stage, res);
        return res;
    }
    return [stage, callAndLog];
}

async function apiCreate(body, owner) {
    let dappName = validate.cleanName(body.DappName);
    let abi = body.Abi;
    let web3URL = body.Web3URL;
    let guardianURL = body.GuardianURL;
    let addr = body.ContractAddr;
    let bucketName = s3.newBucketName();
    let s3Dns = null;
    let cloudfrontDistroId = null;
    let cloudfrontDns = null;
    let result = null;

    let [stage, callAndLog] = callFactory('Pre-Creation');

    try {
        await callAndLog('Create S3 Bucket', s3.createBucketWithTags(bucketName, dappName, owner))
        await callAndLog('Set Bucket Readable', s3.setBucketPublic(bucketName));
        await callAndLog('Configure Bucket Website', s3.configureBucketWebsite(bucketName))
        await callAndLog('Put DappSeed', s3.putDappseed({
            dappName, web3URL, guardianURL, abi, addr
        }));
        await callAndLog('Create CodePipeline', codepipeline.create(dappName, bucketName));
        s3Dns = s3.bucketEndpoint(bucketName);
        result = await callAndLog('Create Cloudfront Distro', cloudfront.createDistro(dappName, owner, s3Dns));
        cloudfrontDistroId = result.Distribution.Id;
        cloudfrontDns = result.Distribution.DomainName;
        await callAndLog('Create Route 53 record', route53.createRecord(dappName, cloudfrontDns));
        await callAndLog('Create DynamoDB record', dynamoDB.putItem(dappName, owner, abi, bucketName, cloudfrontDistroId, cloudfrontDns));
        console.log("Dapp generation successfully initialized!", result);

        let responseBody = {
            method: "create",
            message: "Dapp generation successfully initialized!  Check your URL in about 5 minutes."
        };
        return successResponse(responseBody)
    } catch (e) {
        logErr(stage, e);
        throw e;
    }
}

async function apiRead(body) {
    let dappName = validate.cleanName(body.DappName);

    let [stage, callAndLog] = callFactory('Pre-Read');

    try {
        const dappItem = await callAndLog('Get DynamoDB Item', dynamoDB.getItem(dappName));
        let responseBody = {
            method: "read",
            item: dappItem.Item
        };
        return successResponse(responseBody);
    } catch {
        logErr(stage, e);
    }
}


async function apiDelete(body){
    let dappName = validate.cleanName(body.DappName);
    let bucketName = null;
    let cloudfrontDistroId = null;
    let cloudfrontDns = null;

    let [stage, callAndLog] = callFactory('Pre-Delete');

    try {
        const dbItem = await callAndLog('Get Dapp DynamoDb Item', dynamoDB.getItem(dappName));
        bucketName = dbItem.Item.S3BucketName.S;
        cloudfrontDistroId = dbItem.Item.CloudfrontDistributionId.S;
        cloudfrontDns = dbItem.Item.CloudfrontDnsName.S;
        
        try {
            await callAndLog('Disable Cloudfront distro', cloudfront.disableDistro(cloudfrontDistroId));
            await callAndLog('Delete Cloudfront distro', Promise.resolve("TODO: Cloudfront's delete is turned off until we have a working strategy."));
        } catch (err) {
            switch(err.code) {
                case 'NoSuchDistribution':
                    logSafeErr("Distribution already deleted.")
                    break;
                default:
                    logErr(stage, err);
                    throw err;
            }
        }

        await callAndLog('Delete Route53 Record', route53.deleteRecord(dappName, cloudfrontDns));

        try {
            await callAndLog('Empty S3 Bucket', s3.emptyBucket(bucketName));
            await callAndLog('Delete S3 Bucket', s3.deleteBucket(bucketName));
        } catch (err) {
            switch(err.code) {
                case 'NoSuchBucket':
                    logSafeErr(stage, 'Bucket already deleted.');
                    break;
                default:
                    logErr(stage, err);
                    throw err;
            }
        }

        await callAndLog('Delete DynamoDB item', dynamoDB.deleteItem(dappName));
        await callAndLog('Delete CodePipeline', codepipeline.delete(dappName));

        let responseBody = {
            method: "delete",
            message: "Your Dapp was successfully deleted."
        };
        return successResponse(responseBody);

    } catch (e) {
        logErr(stage, e);
        throw e;
    }

}

module.exports = {
  create : apiCreate,
  read : apiRead,
  delete : apiDelete
}