const { cognito, dynamoDB } = require('./services');
const assert = require('assert');

const dappLimitAttrName = 'dev:custom:num_dapps';

function validateBodyDelete(body) {
    if (!body.hasOwnProperty('DappName')) {
        throw new Error("delete: required argument 'DappName' not found");
    }
}

function validateBodyRead(body) {
    if (!body.hasOwnProperty('DappName')) {
        throw new Error("read: required argument 'DappName' not found");
    }
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
    if (!body.hasOwnProperty('ContractAddr')) {
        throw new Error("create: required argument 'ContractAddr' not found");
    }
    if (!body.hasOwnProperty('Web3URL')) {
        throw new Error("create: required argument 'Web3URL' not found");
    }
    if (!body.hasOwnProperty('GuardianURL')) {
        throw new Error("create: required argument 'GuardianURL' not found");
    }
}

async function validateLimitsCreate(cognitoUsername, ownerEmail) {
    console.log("Validating Limits for User", cognitoUsername);
    let dappLimit = null;
    return cognito.getUser(cognitoUsername).then(function(result) {
        console.log("Found Cognito User", result);
        let attrList = result.UserAttributes;
        let dappLimitAttr = attrList.filter(attr => attr.Name === dappLimitAttrName);
        assert(dappLimitAttr.length === 1);
        dappLimit = dappLimitAttr[0].Value;

        return dynamoDB.scanByOwner(ownerEmail);
    })
    .then(function(result) {
        console.log("Scanned DynamoDB Table", result);
        let numDappsOwned = result.Items.length;
        assert(numDappsOwned + 1 <= dappLimit, "User " + ownerEmail + " already at dapp limit: " + dappLimit);
        return true;
    })
    .catch(function(err) {
        console.log("Error Validating Limit", err);
        throw err;
    })
}

async function validateCreate(body, cognitoUsername) {
    validateBodyCreate(body);
    try {
        return await validateLimitsCreate(cognitoUsername, body.OwnerEmail);
    } catch (err) {
        throw err;
    }
}

async function validateDelete(body) {
    validateBodyDelete(body);
    return true;
}

async function validateRead(body) {
    validateBodyRead(body);
    return true;
}

module.exports = {
    delete : validateDelete,
    create : validateCreate,
    read : validateRead
}