const { addAwsPromiseRetries } = require('../common');
const { AWS, tableName } = require('../env');
const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

function serializeDdbKey(dappName) {
    let keyItem = {
        'DappName': {S: dappName}
    };
    return keyItem;
}

async function promiseSetDappAvailable(dappName) {
    let dbResponse = await promiseGetDappItem(dappName);
    let dbItem = dbResponse.Item;
    dbItem.State.S = 'AVAILABLE';

    return promisePutRawDappItem(dbItem);
}

function promiseSetItemBuilding(dbItem, cloudfrontDistroId, cloudfrontDns) {
    if (cloudfrontDistroId) {
        dbItem.CloudfrontDistributionId = {S: cloudfrontDistroId};
    }
    if (cloudfrontDns) {
        dbItem.CloudfrontDnsName = {S: cloudfrontDns};
    }

    dbItem.State.S = 'BUILDING_DAPP';

    return promisePutRawDappItem(dbItem);
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
    getItem : promiseGetDappItem,
    deleteItem : promiseDeleteDappItem,
    getByOwner : promiseGetItemsByOwner,
    setDappAvailable : promiseSetDappAvailable,
    setItemBuilding : promiseSetItemBuilding
}