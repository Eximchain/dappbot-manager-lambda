const { dynamoDB, route53, cloudfront, s3, codepipeline } = require('./services');
const validate = require('./validate');
const assert = require('assert');

const logErr = (stage, err) => { console.log(`Error on ${stage}: `, err) }
const logNonFatalErr = (stage, reason) => { console.log(`Ignoring non-fatal error during ${stage}: ${reason}`) }
const logSuccess = (stage, res) => { console.log(`Successfully completed ${stage}; result: `, res) }

function response(body, opts) {
    let responseCode = opts.isCreate ? 201 : 200;
    // TODO: Replace with something useful or remove
    let responseHeaders = {"x-custom-header" : "my custom header value"};
    let responseBody = {
        data: body,
        err: null
    };
    return {
        statusCode: responseCode,
        headers: responseHeaders,
        body: JSON.stringify(responseBody)
    }
}

function successResponse(body, opts={isCreate: false}) {
    let successOpt = {isErr: false};
    let callOpts = {...opts, ...successOpt};
    return response(body, callOpts);
}

function errorResponse(body, opts={isCreate: false}) {
    let errorOpt = {isErr: true};
    let callOpts = {...opts, ...errorOpt};
    return response(body, callOpts);
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
                        let conflictingDistro = await callAndLog('Get Conflicting Cloudfront Distro', cloudfront.getConflictingDistro(dappName));

                        if (!conflictingDistro) {
                            console.log("UNEXPECTED ERROR: Conflicting distro not found despite 'CNAMEAlreadyExists' error");
                            throw err;
                        }

                        let conflictingDistroArn = conflictingDistro.ARN;
                        let existingDappOwner = await callAndLog('Get Conflicting Cloudfront Distro Owner', cloudfront.getDistroOwner(conflictingDistroArn));
                        
                        // Don't let the caller take someone else's distribution
                        assert(owner === existingDappOwner, err);

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
        await callAndLog('Create DynamoDB item', dynamoDB.putItem(dappName, owner, abi, bucketName, cloudfrontDistroId, cloudfrontDns, addr, web3URL, guardianURL));

        console.log("Dapp generation successfully initialized!");

        let responseBody = {
            method: "create",
            message: "Dapp generation successfully initialized!  Check your URL in about 5 minutes."
        };
        return successResponse(responseBody, {isCreate: true})
    } catch (err) {
        logErr(stage, err);
        return errorResponse(err, {isCreate: true});
    }
}

async function apiRead(body, callerEmail) {
    let dappName = validate.cleanName(body.DappName);

    let [stage, callAndLog] = callFactory('Pre-Read');

    try {
        const dbItem = await callAndLog('Get DynamoDB Item', dynamoDB.getItem(dappName));
        let outputItem = dynamoDB.toApiRepresentation(dbItem.Item);
        if (outputItem.OwnerEmail !== callerEmail) {
            outputItem = {};
        }
        let itemExists = Boolean(outputItem.DappName);
        let responseBody = {
            method: "read",
            exists: itemExists,
            item: outputItem
        };
        return successResponse(responseBody);
    } catch (err) {
        logErr(stage, err);
        return errorResponse(err);
    }
}

async function apiUpdate(body, owner) {
    let dappName = validate.cleanName(body.DappName);
    // These values may or may not be defined
    let abi = body.Abi;
    let web3URL = body.Web3URL;
    let guardianURL = body.GuardianURL;
    let addr = body.ContractAddr;

    let [stage, callAndLog] = callFactory('Pre-Update');

    try {
        if (!abi && !web3URL && !guardianURL && !addr) {
            let responseBody = {
                method: "update",
                message: "No attributes specified to update."
            };
            return successResponse(responseBody);
        }
        const dbItem = await callAndLog('Get DynamoDB Item', dynamoDB.getItem(dappName));
        assert(dbItem.Item, "Dapp Not Found");

        let dbOwner = dbItem.Item.OwnerEmail.S;
        let cloudfrontDistroId = dbItem.Item.CloudfrontDistributionId.S;
        assert(owner === dbOwner, "You do not have permission to update the specified Dapp.");

        let rawItem = dbItem.Item;

        let updatedAbi = abi ? abi : rawItem.Abi.S;
        let updatedWeb3URL = web3URL ? web3URL : rawItem.Web3URL.S;
        let updatedGuardianURL = guardianURL ? guardianURL : rawItem.GuardianURL.S;
        let updatedAddr = addr ? addr : rawItem.ContractAddr.S;

        rawItem.Abi.S = updatedAbi;
        rawItem.Web3URL.S = updatedWeb3URL;
        rawItem.GuardianURL.S = updatedGuardianURL;
        rawItem.ContractAddr.S = updatedAddr;

        await callAndLog('Update DappSeed', s3.putDappseed({ dappName, updatedWeb3URL, updatedGuardianURL, updatedAbi, updatedAddr }));
        await callAndLog('Update DynamoDB item', dynamoDB.putRawItem(rawItem));
        // TODO: Make this happen after the pipeline build
        await callAndLog('Invalidate Cloudfront Distro', cloudfront.invalidateDistroPrefix(cloudfrontDistroId));

        let responseBody = {
            method: "update",
            message: "Your Dapp was successfully updated! Allow 5 minutes for rebuild, then check your URL."
        };
        return successResponse(responseBody);
    } catch (err) {
        logErr(stage, err);
        return errorResponse(err); 
    }
}

async function apiDelete(body) {
    let dappName = validate.cleanName(body.DappName);

    let [stage, callAndLog] = callFactory('Pre-Delete');

    try {
        const dbItem = await callAndLog('Get Dapp DynamoDb Item', dynamoDB.getItem(dappName));
        assert(dbItem.Item, "Dapp Not Found");

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
        return successResponse(responseBody);

    } catch (err) {
        logErr(stage, err);
        return errorResponse(err);
    }

}

async function apiList(owner) {
    let [stage, callAndLog] = callFactory('Pre-List');

    try {
        let ddbResponse = await callAndLog('List DynamoDB Items', dynamoDB.getByOwner(owner));
        let outputItems = ddbResponse.Items.map(item => dynamoDB.toApiRepresentation(item));
        let responseBody = {
            method: "list",
            count: ddbResponse.Count,
            items: outputItems
        };
    return successResponse(responseBody);
    } catch (err) {
        logErr(stage, err);
        return errorResponse(err);
    }
}

module.exports = {
  create : apiCreate,
  read : apiRead,
  update : apiUpdate,
  delete : apiDelete,
  list : apiList
}