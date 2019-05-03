const { dynamoDB, route53, cloudfront, s3, codepipeline } = require('./services');
const validate = require('./validate');
const assert = require('assert');

const logErr = (stage, err) => { console.log(`Error on ${stage}: `, err) }
const logNonFatalErr = (stage, reason) => { console.log(`Ignoring non-fatal error during ${stage}: ${reason}`) }
const logSuccess = (stage, res) => { console.log(`Successfully completed ${stage}; result: `, res) }

function response(body) {
    let responseCode = 200;
    // TODO: Replace with something useful or remove
    let responseHeaders = {"x-custom-header" : "my custom header value"};
    return {
        statusCode: responseCode,
        headers: responseHeaders,
        body: JSON.stringify(body)
    }
}

// Using this factory function lets us create a new "stage" variable
// for each invocation.  Otherwise, `stage` and `callAndLog` function would
// need to be re-declared in each of the functions below.
function callFactory(startStage) {
    let stage = startStage;
    const callAndLog = async (newStage, promise) => {
        stage = newStage;
        let res = await promise;
        logSuccess(newStage, res);
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
    let s3Dns = s3.bucketEndpoint(bucketName);

    let [stage, callAndLog] = callFactory('Pre-Creation');

    try {
        await callAndLog('Create S3 Bucket', s3.createBucketWithTags(bucketName, dappName, owner))
        await callAndLog('Set Bucket Readable', s3.setBucketPublic(bucketName));
        await callAndLog('Configure Bucket Website', s3.configureBucketWebsite(bucketName))
        await callAndLog('Put DappSeed', s3.putDappseed({ dappName, web3URL, guardianURL, abi, addr }));
        await callAndLog('Create CodePipeline', codepipeline.create(dappName, bucketName));

        let cloudfrontDistroId = null;
        let cloudfrontDns = null;
        try {
            const newDistro = await callAndLog('Create Cloudfront Distro', cloudfront.createDistro(dappName, owner, s3Dns));

            cloudfrontDistroId = newDistro.Distribution.Id;
            cloudfrontDns = newDistro.Distribution.DomainName;
        } catch (err) {
            switch(err.code) {
                case 'CNAMEAlreadyExists':
                    try {
                        let conflictingAlias = route53.dappDNS(dappName);
                        let existingDistros = await callAndLog('List Cloudfront Distro', cloudfront.listDistros());

                        let existingDistrosMatchingAlias = existingDistros.Items.filter(item => item.Aliases.Quantity === 1)
                                                                                .filter(item => item.Aliases.Items[0] === conflictingAlias);
                        assert(existingDistrosMatchingAlias.length == 1, `Found ${existingDistrosMatchingAlias.length} distribution with matching CNAME instead of exactly 1. This must be a bug!`);
                        let conflictingDistro = existingDistrosMatchingAlias[0];
                        console.log("Cloudfront Distribution with conflicting CNAME", conflictingDistro);
                        let conflictingDistroArn = conflictingDistro.ARN;

                        let conflictingDistroTagResponse = await callAndLog('List Cloudfront Tags', cloudfront.listTags(conflictingDistroArn));

                        let conflictingDistroTags = conflictingDistroTagResponse.Tags.Items;
                        let dappOwnerTagList = conflictingDistroTags.filter(tag => tag.Key === 'DappOwner');
                        assert(existingDistrosMatchingAlias.length == 1, `Found ${existingDistrosMatchingAlias.length} tags with Key 'DappOwner' instead of exactly 1. This must be a bug!`);
                        let existingDappOwner = dappOwnerTagList[0].Value;
                        
                        if (owner !== existingDappOwner) {
                            // Don't let the caller take someone else's distribution
                            throw err;
                        }

                        // Required vars to exit the block without errors
                        cloudfrontDistroId = conflictingDistro.Id;
                        cloudfrontDns = conflictingDistro.DomainName;

                        await callAndLog('Update Cloudfront Origin', cloudfront.updateOriginAndEnable(cloudfrontDistroId, s3Dns));                      
                    } catch (err) {
                        logErr(stage, err);
                        throw err;
                    }
                    break;
                default:
                    logErr(stage, err);
                    throw err;
            }
        }

        await callAndLog('Create Route 53 record', route53.createRecord(dappName, cloudfrontDns));
        await callAndLog('Create DynamoDB item', dynamoDB.putItem(dappName, owner, abi, bucketName, cloudfrontDistroId, cloudfrontDns));

        console.log("Dapp generation successfully initialized!");

        let responseBody = {
            method: "create",
            message: "Dapp generation successfully initialized!  Check your URL in about 5 minutes."
        };
        return response(responseBody)
    } catch (err) {
        logErr(stage, err);
        return response(err);
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
        return response(responseBody);
    } catch (err) {
        logErr(stage, err);
        return response(err);
    }
}


async function apiDelete(body) {
    let dappName = validate.cleanName(body.DappName);

    let [stage, callAndLog] = callFactory('Pre-Delete');

    try {
        const dbItem = await callAndLog('Get Dapp DynamoDb Item', dynamoDB.getItem(dappName));

        let bucketName = dbItem.Item.S3BucketName.S;
        let cloudfrontDistroId = dbItem.Item.CloudfrontDistributionId.S;
        let cloudfrontDns = dbItem.Item.CloudfrontDnsName.S;
        
        try {
            await callAndLog('Disable Cloudfront distro', cloudfront.disableDistro(cloudfrontDistroId));
            await callAndLog('Delete Cloudfront distro', Promise.resolve("TODO: Cloudfront's delete is turned off until we have a working strategy."));
        } catch (err) {
            switch(err.code) {
                case 'NoSuchDistribution':
                    logNonFatalErr("Distribution already deleted.")
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
                    logNonFatalErr(stage, 'Bucket already deleted.');
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
        return response(responseBody);

    } catch (err) {
        logErr(stage, err);
        return response(err, {isErr:true});
    }

}

module.exports = {
  create : apiCreate,
  read : apiRead,
  delete : apiDelete
}