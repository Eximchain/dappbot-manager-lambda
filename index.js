'use strict';

const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');

const awsRegion = process.env.AWS_REGION;
const tableName = process.env.DDB_TABLE;
const r53HostedZoneId = process.env.R53_HOSTED_ZONE_ID;
const dnsRoot = process.env.DNS_ROOT;
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
const cloudfront = new AWS.CloudFront({apiVersion: '2018-11-05'});
const route53 = new AWS.Route53({apiVersion: '2013-04-01'});

async function apiCreate(body) {
    return new Promise(function(resolve, reject) {
        try {
            validateBodyCreate(body);
        } catch(err) {
            reject(err);
        }
        let dappName = body.DappName;
        let owner = body.OwnerEmail;
        let abi = body.Abi;
        let bucketName = createBucketName();
        let s3Dns = null;
        let cloudfrontDistroId = null;
        let cloudfrontDns = null;

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
            s3Dns = getS3BucketEndpoint(bucketName);
            return promiseCreateCloudfrontDistribution(dappName, s3Dns);
        })
        .then(function(result) {
            console.log("Create Cloudfront Distribution Success", result);
            cloudfrontDistroId = result.Distribution.Id;
            cloudfrontDns = result.Distribution.DomainName;
            return promiseCreateDnsRecord(dappName, cloudfrontDns);
        })
        .then(function(result) {
            console.log("Create DNS Record Success", result);
            // TODO: Put custom dns instead
            return promisePutDappItem(dappName, owner, abi, bucketName, cloudfrontDistroId, cloudfrontDns);
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
        let dappName = body.DappName;

        promiseGetDappItem(dappName).then(function(result) {
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

// TODO: Make sure incomplete steps are cleaned up
async function apiDelete(body) {
    return new Promise(function(resolve, reject) {
        try {
            validateBodyDelete(body);
        } catch(err) {
            reject(err);
        }
        let dappName = body.dappName;
        let bucketName = null;
        let cloudfrontDistroId = null;
        let cloudfrontDns = null;

        promiseGetDappItem(dappName).then(function(result) {
            console.log("Get Dapp Item Success", result);
            bucketName = result.Item.S3BucketName.S;
            cloudfrontDistroId = result.Item.CloudfrontDistributionId.S;
            cloudfrontDns = result.Item.CloudfrontDnsName.S;
            return promiseDisableCloudfrontDistribution(cloudfrontDistroId);
        })
        .then(function(result) {
            console.log("Cloudfront Disable Success", result);
            return promiseDeleteDnsRecord(dappName, cloudfrontDns);
        })
        .then(function(result) {
            console.log("Delete DNS Record Success", result);
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

function serializeDdbItem(dappName, ownerEmail, abi, bucketName, cloudfrontDns, cloudfrontDistroId) {
    let creationTime = new Date().toISOString();
    let item = {
        'DappName' : {S: dappName},
        'OwnerEmail' : {S: ownerEmail},
        'CreationTime' : {S: creationTime},
        'Abi' : {S: abi},
        'S3BucketName' : {S: bucketName},
        'CloudfrontDistributionId' : {S: cloudfrontDistroId},
        'CloudfrontDnsName' : {S: cloudfrontDns},
        'DnsName' : {S: dnsNameFromDappName(dappName)}
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

function getS3BucketEndpoint(bucketName) {
    return bucketName.concat(".s3.").concat(awsRegion).concat(".amazonaws.com");
}

function promisePutDappItem(dappName, owner, abi, bucketName, cloudfrontDistroId, cloudfrontDns) {
    let putItemParams = {
        TableName: tableName,
        Item: serializeDdbItem(dappName, owner, abi, bucketName, cloudfrontDns, cloudfrontDistroId)
    };

    return ddb.putItem(putItemParams).promise();
}

function promiseGetDappItem(dappName) {
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
    console.log("Emptying S3 bucket ", bucketName)
    // TODO: Does this have issues with the limit of list objects?
    return promiseListS3Objects(bucketName).then(function(result) {
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
        let retPromise = Promise.all(deletePromises);
        console.log("Returning promise", retPromise, "With deletePromises", deletePromises)
        return retPromise;
    })
    .catch(function(err) {
        console.log("Error", err);
        return Promise.reject(err);
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

function promiseCreateCloudfrontDistribution(appName, s3Origin) {
    // TODO: Origin Access Identity
    // TODO: Verify that we want these args
    // TODO: Set up SSL
    let params = {
        DistributionConfig: {
            CallerReference: uuidv4(),
            DefaultRootObject: 'index.html',
            Origins: {
                Quantity: 1,
                Items: [{
                    Id: 's3-origin',
                    DomainName: s3Origin,
                    S3OriginConfig: {
                        OriginAccessIdentity: ''
                    }
                }],
            },
            DefaultCacheBehavior: {
                TargetOriginId: 's3-origin',
                ForwardedValues: {
                    QueryString: false,
                    Cookies: {
                        Forward: 'none'
                    },
                    Headers: {
                        Quantity: 0
                    }
                },
                TrustedSigners: {
                    Quantity: 0,
                    Enabled: false
                },
                ViewerProtocolPolicy: 'allow-all',
                MinTTL: 0,
                AllowedMethods: {
                    Quantity: 7,
                    Items: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'PATCH', 'POST', 'DELETE']
                }
            },
            Enabled: true,
            Comment: "Cloudfront distribution for ".concat(appName)
        }
    };
    return cloudfront.createDistribution(params).promise();
}

function promiseGetCloudfrontDistributionConfig(distroId) {
    let params = {
        Id: distroId
    }
    return cloudfront.getDistributionConfig(params).promise();
}

function promiseDisableCloudfrontDistribution(distroId) {
    return promiseGetCloudfrontDistributionConfig(distroId).then(function(result) {
        console.log("Get Cloudfront Distro Config Success", result);
        let config = result.DistributionConfig;
        config.Enabled = false;

        let params = {
            Id: distroId,
            IfMatch: result.ETag,
            DistributionConfig: config
        };
        return cloudfront.updateDistribution(params).promise();
    })
    .catch(function(err) {
        console.log("Error", err);
        return Promise.reject(err);
    });
}

function promiseCreateDnsRecord(dappName, cloudfrontDns) {
    // TODO: Sanitize for URL
    let name = dnsNameFromDappName(dappName);
    let params = {
        HostedZoneId: r53HostedZoneId,
        ChangeBatch: {
            Changes: [{
                Action: 'CREATE',
                ResourceRecordSet: {
                    AliasTarget: {
                        DNSName: cloudfrontDns, 
                        EvaluateTargetHealth: false, 
                        HostedZoneId: "Z2FDTNDATAQYW2"
                    },
                    Name: name, 
                    Type: "A"
                }
            }]
        }
    }
    return route53.changeResourceRecordSets(params).promise();
}

function promiseDeleteDnsRecord(dappName, cloudfrontDns) {
    // TODO: Sanitize for URL
    let name = dnsNameFromDappName(dappName);
    let params = {
        HostedZoneId: r53HostedZoneId,
        ChangeBatch: {
            Changes: [{
                Action: 'DELETE',
                ResourceRecordSet: {
                    AliasTarget: {
                        DNSName: cloudfrontDns, 
                        EvaluateTargetHealth: false, 
                        HostedZoneId: "Z2FDTNDATAQYW2"
                    }, 
                    Name: name, 
                    Type: "A"
                }
            }]
        }
    }
    return route53.changeResourceRecordSets(params).promise();
}

function dnsNameFromDappName(dappName) {
    return dappName.concat(dnsRoot);
}