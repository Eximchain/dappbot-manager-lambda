'use strict';

const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');

const awsRegion = process.env.AWS_REGION;
const tableName = process.env.DDB_TABLE;
const s3BucketPrefix = "exim-abi-clerk-";

const sampleHtml = `<html>
<header><title>This is title</title></header>
<body>
Hello world
</body>
</html>`;

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
            return promiseConfigureS3BucketStaticWebsite(bucketName);
        })
        .then(function(result) {
            console.log("Configure Bucket Static Website Success", result);
            return promisePutS3Objects(bucketName);
        })
        .then(function(result) {
            console.log("Put S3 Objects Success", result);
            let s3Dns = getS3WebsiteEndpoint(bucketName);
            return promisePutDappItem(body, bucketName, s3Dns);
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

        let bucketName = null;
        promiseGetDappItem(body).then(function(result) {
            console.log("Get Dapp Item Success", result);
            bucketName = result.Item.S3BucketName.S;
            return promiseEmptyS3Bucket(bucketName);
        })
        .then(function(result) {
            console.log("S3 Bucket Empty Success", result);
            return promiseDeleteS3Bucket(bucketName);
        })
        .then(function(result) {
            console.log("S3 Bucket Delete Success", result);
            return promiseDeleteDappItem(body);
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

function serializeDdbItem(dappName, ownerEmail, abi, bucketName, s3Dns) {
    let creationTime = new Date().toISOString();
    let cloudfrontDistro = "Cloudfront placeholder";
    let item = {
        'DappName' : {S: dappName},
        'OwnerEmail' : {S: ownerEmail},
        'CreationTime' : {S: creationTime},
        'Abi' : {S: abi},
        'S3BucketName' : {S: bucketName},
        'CloudfrontDistributionId' : {S: cloudfrontDistro},
        'DnsName' : {S: s3Dns}
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

function getS3WebsiteEndpoint(bucketName) {
    return bucketName.concat('.').concat(getS3WebsiteDomain());
}

function getS3WebsiteDomain() {
    let oldRegions = ["ap-northeast-1", "ap-southeast-1", "ap-southeast-2", "eu-west-1",
    "sa-east-1", "us-east-1",  "us-gov-west-1", "us-west-1", "us-west-2"];

    if (oldRegions.includes(awsRegion)) {
        return 's3-website-'.concat(awsRegion).concat('.amazonaws.com');
    }
    return 's3-website.'.concat(awsRegion).concat('.amazonaws.com');
}

function promisePutDappItem(body, bucketName, s3Dns) {
    let dappName = body.DappName;
    let owner = body.OwnerEmail;
    let abi = body.Abi;

    let putItemParams = {
        TableName: tableName,
        Item: serializeDdbItem(dappName, owner, abi, bucketName, s3Dns)
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
        Bucket: bucketName,
        ACL: 'public-read'
    };
    return s3.createBucket(params).promise();
}

function promiseDeleteS3Bucket(bucketName) {
    let params = {
        Bucket: bucketName
    };
    return s3.deleteBucket(params).promise();
}

function promiseListS3Objects(bucketName) {
    let params = {
        Bucket: bucketName
    };
    return s3.listObjects(params).promise();
}

function promiseEmptyS3Bucket(bucketName) {
    return new Promise(function(resolve, reject) {
        // TODO: Does this have issues with the limit of list objects?
        promiseListS3Objects(bucketName).then(function(result) {
            console.log("List S3 Objects Success", result);
            let objects = result.Contents;
            let deletePromises = [];
            for (var i = 0; i < objects.length; i += 1) {
                let deleteParams = {
                    Bucket: bucketName,
                    Key: objects[i].Key
                };
                deletePromises.push(s3.deleteObject(deleteParams).promise());
            }
            // TODO: I thought this would be a return but it seems to only work when I resolve here. Should probably double check.
            resolve(Promise.all(deletePromises));
        })
        .catch(function(err) {
            console.log("Error", err);
            reject(err);
        })
    });
}

function promiseConfigureS3BucketStaticWebsite(bucketName) {
    let params = {
        Bucket: bucketName,
        WebsiteConfiguration: {
            ErrorDocument: {
                Key: 'error.html'
            },
            IndexDocument: {
                Suffix: 'index.html'
            }
        }
    };
    return s3.putBucketWebsite(params).promise();
}

function promiseGetS3BucketWebsiteConfig(bucketName) {
    let params = {
        Bucket: bucketName
    };
    return s3.getBucketWebsite(params).promise();
}

function promisePutS3Objects(bucketName) {
    let params = {
        Bucket: bucketName,
        ACL: 'public-read',
        ContentType: 'text/html',
        Key: 'index.html',
        Body: sampleHtml
    };
    return s3.putObject(params).promise();
}