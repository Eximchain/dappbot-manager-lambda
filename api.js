const { dynamoDB, route53, cloudfront, s3, codepipeline } = require('./services');
const validate = require('./validate');
const assert = require('assert');

const logErr = (stage, err) => { console.log(`Error on ${stage}: `, err) }
const logNonFatalErr = (stage, reason) => { console.log(`Ignoring non-fatal error during ${stage}: ${reason}`) }
const logSuccess = (stage, res) => { console.log(`Successfully completed ${stage}; result: `, res) }

function response(body, opts) {
    let responseCode = 200;
    // Override response code based on opts
    if (opts.isErr) {
        responseCode = 500;
    } else if (opts.isCreate) {
        responseCode = 201;
    }

    // TODO: Replace with something useful or remove
    let responseHeaders = {
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' ,
        'Access-Control-Allow-Headers': 'Authorization,Content-Type'
    };
    

    let dataField = opts.isErr ? {} : body;
    let errField = opts.isErr ? body : null;
    let responseBody = {
        data: dataField,
        err: errField
    };
    let jsonResponse = JSON.stringify(responseBody);
    if (opts.isErr) {
        console.log("Error Processing Record");
        throw {};
    } else {
        console.log("Success Processing Record");
        return {};
    }
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

async function apiCreate(dappName) {
    let [stage, callAndLog] = callFactory('Pre-Creation');

    try {
        let dbItem = await callAndLog('Get DynamoDB Item', dynamoDB.getItem(dappName));

        let abi = dbItem.Item.Abi.S;
        let addr = dbItem.Item.ContractAddr.S;
        let web3URL = dbItem.Item.Web3URL.S;
        let guardianURL = dbItem.Item.GuardianURL.S;
        let bucketName = dbItem.Item.S3BucketName.S;
        let s3Dns = s3.bucketEndpoint(bucketName);
        let owner = dbItem.Item.OwnerEmail.S;
        let pipelineName = dbItem.Item.PipelineName.S;
        let dnsName = dbItem.Item.DnsName.S;

        await callAndLog('Create S3 Bucket', s3.createBucketWithTags(bucketName, dappName, owner));
        await callAndLog('Set Bucket Readable', s3.setBucketPublic(bucketName));
        await callAndLog('Configure Bucket Website', s3.configureBucketWebsite(bucketName));
        await callAndLog('Enable Bucket CORS', s3.enableBucketCors(bucketName, dappName));
        await callAndLog('Put Loading Page', s3.putLoadingPage(bucketName));

        // Making Cloudfront Distribution first because we now want to incorporate its ID into the
        // dappseed.zip information for use at cleanup time.
        let cloudfrontDistroId, cloudfrontDns;
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

        await callAndLog('Put DappSeed', s3.putDappseed({ dappName, web3URL, guardianURL, abi, addr, cdnURL: cloudfrontDns }));
        await callAndLog('Create CodePipeline', codepipeline.create(dappName, pipelineName, bucketName, owner));
        await callAndLog('Create Route 53 record', route53.createRecord(dnsName, cloudfrontDns));
        await callAndLog('Set DynamoDB item BUILDING_DAPP', dynamoDB.setItemBuilding(dbItem.Item, cloudfrontDistroId, cloudfrontDns));

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

async function apiUpdate(dappName) {
    let [stage, callAndLog] = callFactory('Pre-Update');

    try {
        const dbItem = await callAndLog('Get DynamoDB Item', dynamoDB.getItem(dappName));
        assert(dbItem.Item, "Dapp Not Found");

        let abi = dbItem.Item.Abi.S;
        let addr = dbItem.Item.ContractAddr.S;
        let web3URL = dbItem.Item.Web3URL.S;
        let guardianURL = dbItem.Item.GuardianURL.S;
        let cdnURL = dbItem.Item.CloudfrontDnsName.S;

        await callAndLog('Update DappSeed', s3.putDappseed({ dappName, web3URL, guardianURL, abi, addr, cdnURL }));
        await callAndLog('Set DynamoDB item BUILDING_DAPP', dynamoDB.setItemBuilding(dbItem.Item));

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

async function apiDelete(dappName) {
    let [stage, callAndLog] = callFactory('Pre-Delete');

    try {
        const dbItem = await callAndLog('Get Dapp DynamoDb Item', dynamoDB.getItem(dappName));
        assert(dbItem.Item, "Dapp Not Found");

        let bucketName = dbItem.Item.S3BucketName.S;
        let cloudfrontDistroId = dbItem.Item.CloudfrontDistributionId.S;
        let cloudfrontDns = dbItem.Item.CloudfrontDnsName.S;
        let pipelineName = dbItem.Item.PipelineName.S;
        let dnsName = dbItem.Item.DnsName.S;
        
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

        await callAndLog('Delete Route53 Record', route53.deleteRecord(dnsName, cloudfrontDns));

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
        await callAndLog('Delete CodePipeline', codepipeline.delete(pipelineName));

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

module.exports = {
  create : apiCreate,
  update : apiUpdate,
  delete : apiDelete,
  errorResponse : errorResponse,
  successResponse : successResponse
}