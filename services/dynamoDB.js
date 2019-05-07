const { addAwsPromiseRetries } = require('../common');
const { AWS, tableName } = require('../env');
const { dappDNS } = require('./route53');
const { pipelineName } = require('./codepipeline');
const validate = require('../validate');
const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

function serializeDdbKey(dappName) {
    let keyItem = {
        'DappName': {S: dappName}
    };
    return keyItem;
}

function serializeDdbItem(dappName, ownerEmail, abi, bucketName, cloudfrontDns, cloudfrontDistroId, contractAddr, web3Url, guardianUrl) {
    let creationTime = new Date().toISOString();
    let item = {
        'DappName' : {S: dappName},
        'OwnerEmail' : {S: ownerEmail},
        'CreationTime' : {S: creationTime},
        'Abi' : {S: abi},
        'ContractAddr' : {S: contractAddr},
        'Web3URL' : {S: web3Url},
        'GuardianURL' : {S: guardianUrl},
        'S3BucketName' : {S: bucketName},
        'CloudfrontDistributionId' : {S: cloudfrontDistroId},
        'CloudfrontDnsName' : {S: cloudfrontDns},
        'PipelineName' : {S: pipelineName(dappName)},
        'DnsName' : {S: dappDNS(dappName)}
    };
    return item;
}

function dbItemToApiRepresentation(dbItem) {
    validate.dbItem(dbItem);
    
    let dappName = dbItem.DappName.S;
    let ownerEmail = dbItem.OwnerEmail.S;
    let creationTime = dbItem.CreationTime.S;
    let dnsName = dbItem.DnsName.S;
    let abi = dbItem.Abi.S;
    let contractAddr = dbItem.ContractAddr.S;
    let web3Url = dbItem.Web3URL.S;
    let guardianUrl = dbItem.GuardianURL.S;

    let apiItem = {
        "DappName": dappName,
        "OwnerEmail": ownerEmail,
        "CreationTime": creationTime,
        "DnsName": dnsName,
        "Abi": abi,
        "ContractAddr": contractAddr,
        "Web3URL": web3Url,
        "GuardianURL": guardianUrl
    };
    return apiItem;
}

function promisePutDappItem(dappName, owner, abi, bucketName, cloudfrontDistroId, cloudfrontDns, contractAddr, web3Url, guardianUrl) {
    let maxRetries = 5;
    let putItemParams = {
        TableName: tableName,
        Item: serializeDdbItem(dappName, owner, abi, bucketName, cloudfrontDns, cloudfrontDistroId, contractAddr, web3Url, guardianUrl)
    };

    return addAwsPromiseRetries(() => ddb.putItem(putItemParams).promise(), maxRetries);
}

function promisePutRawDappItem(item) {
    let maxRetries = 5;
    let putItemParams = {
        TableName: tableName,
        Item: item
    };

    return addAwsPromiseRetries(() => ddb.putItem(putItemParams).promise(), maxRetries);
}

function promiseGetDappItem(dappName) {
    let maxRetries = 5;
    let getItemParams = {
        TableName: tableName,
        Key: serializeDdbKey(dappName)
    };

    return addAwsPromiseRetries(() => ddb.getItem(getItemParams).promise(), maxRetries);
}

function promiseDeleteDappItem(dappName) {
    let maxRetries = 5;
    let deleteItemParams = {
        TableName: tableName,
        Key: serializeDdbKey(dappName)
    };

    return addAwsPromiseRetries(() => ddb.deleteItem(deleteItemParams).promise(), maxRetries);
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

    return addAwsPromiseRetries(() => ddb.query(getItemParams).promise(), maxRetries);
}

module.exports = {
    putItem : promisePutDappItem,
    putRawItem : promisePutRawDappItem,
    getItem : promiseGetDappItem,
    deleteItem : promiseDeleteDappItem,
    getByOwner : promiseGetItemsByOwner,
    toApiRepresentation : dbItemToApiRepresentation
}