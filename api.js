const { dynamoDB, route53, cloudfront, s3, codepipeline } = require('./services');
const validate = require('./validate');

async function apiCreate(body, owner) {
    return new Promise(function(resolve, reject) {
        let dappName = validate.cleanName(body.DappName);
        let abi = body.Abi;
        let web3URL = body.Web3URL;
        let guardianURL = body.GuardianURL;
        let addr = body.ContractAddr;
        let bucketName = s3.newBucketName();
        let s3Dns = null;
        let cloudfrontDistroId = null;
        let cloudfrontDns = null;

        s3.createBucketWithTags(bucketName, dappName)
        .catch(function(err) {
            if (err.handled) {
                throw err;
            }
            console.log("Error Create S3 Bucket", err);
            err.handled = true;
            throw err;
        })
        .then(function(result){
            console.log("Create Bucket Success", result);
            return s3.setBucketPublic(bucketName);
        })
        .then(function(result){
            console.log("Set Bucket as public readable success")
            return s3.configureBucketWebsite(bucketName);
        })
        .catch(function(err) {
            if (err.handled) {
                throw err;
            }
            console.log("Error Configure S3 Bucket", err);
            err.handled = true;
            throw err;
        })
        .then(function(result){
            console.log("Configure Bucket as Static Site success")
            return s3.putDappseed({
                dappName, web3URL, guardianURL, abi, addr
            });
        })
        .catch(function(err) {
            if (err.handled) {
                throw err;
            }
            console.log("Error Put Dappseed", err);
            err.handled = true;
            throw err;
        })
        .then(function(result) {
            console.log("Put Dappseed success", result);
            return codepipeline.create(dappName, bucketName)
        })
        .catch(function(err) {
            if (err.handled) {
                throw err;
            }
            console.log("Error Create CodePipeline", err);
            err.handled = true;
            throw err;
        })
        .then(function(result) {
            console.log("Create CodePipeline success", result);
            s3Dns = s3.bucketEndpoint(bucketName);
            return cloudfront.createDistro(dappName, s3Dns);
        })
        .catch(function(err) {
            if (err.handled) {
                throw err;
            }
            console.log("Error Create CloudFront Distribution", err);
            err.handled = true;
            throw err;
        })
        .then(function(result) {
            console.log("Create Cloudfront Distribution Success", result);
            cloudfrontDistroId = result.Distribution.Id;
            cloudfrontDns = result.Distribution.DomainName;
            return route53.createRecord(dappName, cloudfrontDns);
        })
        .catch(function(err) {
            if (err.handled) {
                throw err;
            }
            console.log("Error Create Route53 Record", err);
            err.handled = true;
            throw err;
        })
        .then(function(result) {
            console.log("Create DNS Record Success", result);
            // TODO: Put custom dns instead
            return dynamoDB.putItem(dappName, owner, abi, bucketName, cloudfrontDistroId, cloudfrontDns);
        })
        .catch(function(err) {
            if (err.handled) {
                throw err;
            }
            console.log("Error Put Dapp Item", err);
            err.handled = true;
            throw err;
        })
        .then(function(result) {
            console.log("Dapp generation successfully initialized!  Check your URL in about 20 minutes.", result);
            let responseCode = 200;
            // TODO: Replace with something useful or remove
            let responseHeaders = {"x-custom-header" : "my custom header value"};

            let responseBody = {
                method: "create"
            };
            let response = {
                statusCode: responseCode,
                headers: responseHeaders,
                body: JSON.stringify(responseBody)
            };
            resolve(response);
        })
        .catch(function(err) {
            console.log("Error", err);
            reject(err);
        })
    });
}

async function apiRead(body) {
    return new Promise(function(resolve, reject) {
        let dappName = validate.cleanName(body.DappName);
        dynamoDB.getItem(dappName)
        .catch(function(err) {
            if (err.handled) {
                throw err;
            }
            console.log("Error Get Dapp Item", err);
            err.handled = true;
            throw err;
        })
        .then(function(result){
            console.log("Get Dapp Item Success", result);
            let responseCode = 200;
            // TODO: Replace with something useful or remove
            let responseHeaders = {"x-custom-header" : "my custom header value"};

            let responseBody = {
                method: "read",
                item: result.Item
            };
            let response = {
                statusCode: responseCode,
                headers: responseHeaders,
                body: JSON.stringify(responseBody)
            };
            resolve(response);
        })
        .catch(function(err) {
            console.log("Error", err);
            reject(err);
        })   
    });
}

// TODO: Make sure incomplete steps are cleaned up
async function apiDelete(body) {
    return new Promise(function(resolve, reject) {
        let dappName = validate.cleanName(body.DappName);
        let bucketName = null;
        let cloudfrontDistroId = null;
        let cloudfrontDns = null;

        dynamoDB.getItem(dappName)
        .catch(function(err) {
            if (err.handled) {
                throw err;
            }
            console.log("Error Get Dapp Item", err);
            err.handled = true;
            throw err;
        })
        .then(function(result){
            console.log("Get Dapp Item Success", result);
            bucketName = result.Item.S3BucketName.S;
            cloudfrontDistroId = result.Item.CloudfrontDistributionId.S;
            cloudfrontDns = result.Item.CloudfrontDnsName.S;
            return cloudfront.disableDistro(cloudfrontDistroId);
        })
        .then(function(result) {
            console.log("Cloudfront Disable Success", result);
            return Promise.resolve("TODO: Cloudfront's delete is turned off until we have a working strategy.");
            // return cloudfront.deleteDistro(cloudfrontDistroId);
        })
        .catch(function(err) {
            if (err.handled) {
                throw err;
            }
            console.log("Error Cloudfront Delete", err);
            err.handled = true;
            switch(err.code) {
                case 'NoSuchDistribution':
                    return Promise.resolve("Distribution already deleted");
            }
            throw err;
        })
        .then(function(result) {
            console.log("Cloudfront Delete Success", result);
            return route53.deleteRecord(dappName, cloudfrontDns);
        })
        .catch(function(err) {
            if (err.handled) {
                throw err;
            }
            console.log("Error Delete Route53 Record", err);
            err.handled = true;
            throw err;
        })
        .then(function(result) {
            console.log("Delete DNS Record Success", result);
            return s3.emptyBucket(bucketName);
        })
        .then(function(result) {
            console.log("S3 Bucket Empty Success", result);
            return s3.deleteBucket(bucketName);
        })
        .catch(function(err) {
            if (err.handled) {
                throw err;
            }
            console.log("Error S3 Bucket Delete", err);
            err.handled = true;
            switch(err.code) {
                case 'NoSuchBucket':
                    return Promise.resolve("Bucket already deleted");
            }
            throw err;
        })
        .then(function(result) {
            console.log("S3 Bucket Delete Success", result);
            return dynamoDB.deleteItem(dappName);
        })
        .catch(function(err) {
            if (err.handled) {
                throw err;
            }
            console.log("Error Delete Dapp Item", err);
            err.handled = true;
            throw err;
        })
        .then(function(result) {
            console.log("Delete Dapp Item Success", result);
            return codepipeline.delete(dappName);
        })
        .catch(function(err) {
            if (err.handled) {
                throw err;
            }
            console.log("Error Delete CodePipeline", err);
            err.handled = true;
            throw err;
        })
        .then(function(result) {
            console.log("Delete CodePipeline Success", result);
            let responseCode = 200;
            // TODO: Replace with something useful or remove
            let responseHeaders = {"x-custom-header" : "my custom header value"};

            let responseBody = {
                method: "delete"
            };
            let response = {
                statusCode: responseCode,
                headers: responseHeaders,
                body: JSON.stringify(responseBody)
            };
            resolve(response);
        })
        .catch(function(err) {
            console.log("Error", err);
            reject(err);
        })
    });
}

module.exports = {
  create : apiCreate,
  read : apiRead,
  delete : apiDelete
}