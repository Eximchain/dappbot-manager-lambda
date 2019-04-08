const validate = require('./validate');
const { dynamoDB, route53, cloudfront, s3, codepipeline } = require('./services');

async function apiCreate(body) {
    return new Promise(function(resolve, reject) {
        try {
            validate.create(body);
        } catch(err) {
            reject(err);
        }
        let dappName = body.DappName;
        let owner = body.OwnerEmail;
        let abi = body.Abi;
        let bucketName = s3.newBucketName();
        let s3Dns = null;
        let cloudfrontDistroId = null;
        let cloudfrontDns = null;

        s3.createBucket(bucketName)
        .then(function(result){
            console.log("Create Bucket Success", result);
            return s3.configureBucketWebsite(bucketName);
        })
        .then(function(result) {
            console.log("Configure Bucket Static Website Success", result);
            return s3.putBucketWebsite(bucketName);
        })
        .then(function(result) {
            console.log("Put S3 Objects Success", result);
            s3Dns = s3.bucketEndpoint(bucketName);
            return cloudfront.createDistro(dappName, s3Dns);
        })
        .then(function(result) {
            console.log("Create Cloudfront Distribution Success", result);
            cloudfrontDistroId = result.Distribution.Id;
            cloudfrontDns = result.Distribution.DomainName;
            return route53.createRecord(dappName, cloudfrontDns);
        })
        .then(function(result) {
            console.log("Create DNS Record Success", result);
            // TODO: Put custom dns instead
            return dynamoDB.putItem(dappName, owner, abi, bucketName, cloudfrontDistroId, cloudfrontDns);
        })
        .then(function(result) {
            console.log("Put Dapp Item Success", result);
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
        try {
            validate.read(body);
        } catch(err) {
            reject(err);
        }
        let dappName = body.DappName;
        dynamoDB.getItem(dappName).then(function(result){
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
        try {
            validate.delete(body);
        } catch(err) {
            reject(err);
        }
        let dappName = body.DappName;
        let bucketName = null;
        let cloudfrontDistroId = null;
        let cloudfrontDns = null;

        dynamoDB.getItem(dappName).then(function(result){
            console.log("Get Dapp Item Success", result);
            bucketName = result.Item.S3BucketName.S;
            cloudfrontDistroId = result.Item.CloudfrontDistributionId.S;
            cloudfrontDns = result.Item.CloudfrontDnsName.S;
            return cloudfront.disableDistro(cloudfrontDistroId);
        })
        .then(function(result) {
            console.log("Cloudfront Disable Success", result);
            return route53.deleteRecord(dappName, cloudfrontDns);
        })
        .then(function(result) {
            console.log("Delete DNS Record Success", result);
            return s3.emptyBucket(bucketName);
        })
        .then(function(result) {
            console.log("S3 Bucket Empty Success", result);
            return s3.deleteBucket(bucketName);
        })
        .then(function(result) {
            console.log("S3 Bucket Delete Success", result);
            return dynamoDB.deleteItem(body);
        })
        .then(function(result){
            console.log("Delete Dapp Item Success", result);
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