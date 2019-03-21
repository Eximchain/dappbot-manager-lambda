'use strict';

const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');

const awsRegion = process.env.AWS_REGION;
const tableName = process.env.DDB_TABLE;
const s3BucketPrefix = "exim-abi-clerk-";

AWS.config.update({region: awsRegion});

const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

async function apiCreate(body) {
    return new Promise(function(resolve, reject) {
        try {
            validateBodyCreate(body);
        } catch(err) {
            reject(err);
        }
        let bucketName = createBucketName();

        promiseCreateS3Bucket(bucketName).then(function(result) {
            console.log("Create Bucket Success", result);
            return promisePutDappItem(body, bucketName);
        })
        .then(function(result) {
            console.log("Put Item Success", result);
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

function validateBodyCreate(body) {
    if (!body.hasOwnProperty('DappName')) {
        throw new Error("create: required argument 'DappName' not found");
    }
    if (!body.hasOwnProperty('OwnerEmail')) {
        throw new Error("create: required argument 'OwnerEmail' not found");
    }
    if (!body.hasOwnProperty('Abi')) {
        throw new Error("create: required argument 'Abi' not found");
    }
}

async function apiRead(body) {
    return new Promise(function(resolve, reject) {
        try {
            validateBodyRead(body);
        } catch(err) {
            reject(err);
        }

        promiseGetDappItem(body).then(function(result) {
            console.log("Get Item Success", result);
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

function validateBodyRead(body) {
    if (!body.hasOwnProperty('DappName')) {
        throw new Error("read: required argument 'DappName' not found");
    }
}

async function apiDelete(body) {
    return new Promise(function(resolve, reject) {
        try {
            validateBodyDelete(body);
        } catch(err) {
            reject(err);
        }

        promiseGetDappItem(body).then(function(result) {
            console.log("Get Item Success", result);
            let bucketName = result.Item.S3BucketName.S;
            return promiseDeleteS3Bucket(bucketName);
        })
        .then(function(result) {
            console.log("S3 Bucket Delete Success", result);
            return promiseDeleteDappItem(body);
        })
        .then(function(result){
            console.log("Delete Item Success", result);
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

function validateBodyDelete(body) {
    if (!body.hasOwnProperty('DappName')) {
        throw new Error("delete: required argument 'DappName' not found");
    }
}
 
exports.handler = async (event) => {
    console.log("request: " + JSON.stringify(event));
    let responseCode = 200;

    let method = event.pathParameters.proxy;
    let body = null;
    if (event.body) {
        body = JSON.parse(event.body);
    }

    let responsePromise = (function(method) {
        switch(method) {
            case 'create':
                return apiCreate(body);
            case 'read':
                return apiRead(body);
            case 'delete':
                return apiDelete(body);
            default:
                throw new Error("Unrecognized method name ".concat(method));
        }
    })(method);

    let response = await responsePromise;
    return response;
};

function serializeDdbItem(dappName, ownerEmail, abi, bucketName) {
    let creationTime = new Date().toISOString();
    let cloudfrontDistro = "Cloudfront placeholder";
    let dnsName = "placeholder.fake.io";
    let item = {
        'DappName' : {S: dappName},
        'OwnerEmail' : {S: ownerEmail},
        'CreationTime' : {S: creationTime},
        'Abi' : {S: abi},
        'S3BucketName' : {S: bucketName},
        'CloudfrontDistributionId' : {S: cloudfrontDistro},
        'DnsName' : {S: dnsName}
    };
    return item;
}

function serializeDdbKey(dappName) {
    let keyItem = {
        'DappName': {S: dappName}
    };
    return keyItem;
}

function createBucketName() {
    return s3BucketPrefix.concat(uuidv4());
}

function promisePutDappItem(body, bucketName) {
    let dappName = body.DappName;
    let owner = body.OwnerEmail;
    let abi = body.Abi;

    let putItemParams = {
        TableName: tableName,
        Item: serializeDdbItem(dappName, owner, abi, bucketName)
    };

    return ddb.putItem(putItemParams).promise();
}

function promiseGetDappItem(body) {
    let dappName = body.DappName;

    let getItemParams = {
        TableName: tableName,
        Key: serializeDdbKey(dappName)
    };

    return ddb.getItem(getItemParams).promise();
}

function promiseDeleteDappItem(body) {
    let dappName = body.DappName;

    let deleteItemParams = {
        TableName: tableName,
        Key: serializeDdbKey(dappName)
    };

    return ddb.deleteItem(deleteItemParams).promise();
}

function promiseCreateS3Bucket(bucketName) {
    let params = {
        Bucket: bucketName
    };
    return s3.createBucket(params).promise();
}

function promiseDeleteS3Bucket(bucketName) {
    let params = {
        Bucket: bucketName
    };
    return s3.deleteBucket(params).promise();
}