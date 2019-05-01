const { retryPromise } = require('../common');
const { AWS, tableName } = require('../env');
const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
const { dappDNS } = require('./route53');

function serializeDdbKey(dappName) {
    let keyItem = {
        'DappName': {S: dappName}
    };
    return keyItem;
}

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
        'DnsName' : {S: dappDNS(dappName)}
    };
    return item;
}

function promisePutDappItem(dappName, owner, abi, bucketName, cloudfrontDistroId, cloudfrontDns) {
    let maxRetries = 5;
    let putItemParams = {
        TableName: tableName,
        Item: serializeDdbItem(dappName, owner, abi, bucketName, cloudfrontDns, cloudfrontDistroId)
    };

    return retryPromise(() => ddb.putItem(putItemParams).promise(), maxRetries);
}

function promiseGetDappItem(dappName) {
    let maxRetries = 5;
    let getItemParams = {
        TableName: tableName,
        Key: serializeDdbKey(dappName)
    };

    return retryPromise(() => ddb.getItem(getItemParams).promise(), maxRetries);
}

function promiseDeleteDappItem(dappName) {
    let maxRetries = 5;
    let deleteItemParams = {
        TableName: tableName,
        Key: serializeDdbKey(dappName)
    };

    return retryPromise(() => ddb.deleteItem(deleteItemParams).promise(), maxRetries);
}

function promiseGetItemsByOwner(ownerEmail) {
    let maxRetries = 5;
    let getItemParams = {
        TableName: tableName,
        IndexName: 'OwnerEmailIndex',
        ExpressionAttributeNames: {
            "#OE": "OwnerEmail"
        }, 
        ExpressionAttributeValues: {
            ":e": {
                S: ownerEmail
            }
        }, 
        KeyConditionExpression: "#OE = :e", 
        Select: 'ALL_PROJECTED_ATTRIBUTES'
    };

    return retryPromise(() => ddb.query(getItemParams).promise(), maxRetries);
}

module.exports = {
    putItem : promisePutDappItem,
    getItem : promiseGetDappItem,
    deleteItem : promiseDeleteDappItem,
    getByOwner : promiseGetItemsByOwner
}