'use strict';

var AWS = require('aws-sdk');

var awsRegion = process.env.AWS_REGION;
AWS.config.update({region: awsRegion});

var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
var tableName = process.env.DDB_TABLE;

async function apiCreate(body) {
    return new Promise(function(resolve, reject) {
        try {
            validateBodyCreate(body);
        } catch(err) {
            reject(err);
        }

        let putDappItemPromise = promisePutDappItem(body);

        let responseCode = 200;
        // TODO: Replace with something useful or remove
        let responseHeaders = {"x-custom-header" : "my custom header value"};

        putDappItemPromise.then(
            function(result) {
                console.log("Put Item Success", result);
                let responseBody = {
                    method: "create"
                };
                let response = {
                    statusCode: responseCode,
                    headers: responseHeaders,
                    body: JSON.stringify(responseBody)
                };
                resolve(response);
            },
            function(err) {
                console.log("Error", err);
                reject(err);
            }
        );
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

        let getItemPromise = promiseGetDappItem(body);

        let responseCode = 200;
        // TODO: Replace with something useful or remove
        let responseHeaders = {"x-custom-header" : "my custom header value"};

        getItemPromise.then(
            function(result) {
                console.log("Get Item Success", result);
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
            },
            function(err) {
                console.log("Error", err);
                reject(err);
            }
        );
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

        let deleteItemPromise = promiseDeleteDappItem(body);

        let responseCode = 200;
        // TODO: Replace with something useful or remove
        let responseHeaders = {"x-custom-header" : "my custom header value"};

        deleteItemPromise.then(
            function(result) {
                console.log("Delete Item Success", result);
                let responseBody = {
                    method: "delete"
                };
                let response = {
                    statusCode: responseCode,
                    headers: responseHeaders,
                    body: JSON.stringify(responseBody)
                };
                resolve(response);
            },
            function(err) {
                console.log("Error", err);
                reject(err);
            }
        );
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

function serializeDdbItem(dappName, ownerEmail, abi) {
    let creationTime = new Date().toISOString();
    let s3Bucket = "S3 placeholder";
    let cloudfrontDistro = "Cloudfront placeholder";
    let dnsName = "placeholder.fake.io";
    let item = {
        'DappName' : {S: dappName},
        'OwnerEmail' : {S: ownerEmail},
        'CreationTime' : {S: creationTime},
        'Abi' : {S: abi},
        'S3BucketName' : {S: s3Bucket},
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

function promisePutDappItem(body) {
    let dappName = body.DappName;
    let owner = body.OwnerEmail;
    let abi = body.Abi;

    let putItemParams = {
        TableName: tableName,
        Item: serializeDdbItem(dappName, owner, abi)
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