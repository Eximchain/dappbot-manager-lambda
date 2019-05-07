const { cognito, dynamoDB } = require('./services');
const assert = require('assert');

const dappLimitAttrName = 'dev:custom:num_dapps';

function validateBodyDelete(body) {
    assert(body.hasOwnProperty('DappName'), "delete: required argument 'DappName' not found");
}

function validateBodyRead(body) {
    assert(body.hasOwnProperty('DappName'), "read: required argument 'DappName' not found");
}

function validateBodyUpdate(body) {
    assert(body.hasOwnProperty('DappName'), "update: required argument 'DappName' not found");
}

function validateBodyCreate(body) {
    assert(body.hasOwnProperty('DappName'), "create: required argument 'DappName' not found");
    assert(body.hasOwnProperty('Abi'), "create: required argument 'Abi' not found");
    assert(body.hasOwnProperty('ContractAddr'), "create: required argument 'ContractAddr' not found");
    assert(body.hasOwnProperty('Web3URL'), "create: required argument 'Web3URL' not found");
    assert(body.hasOwnProperty('GuardianURL'), "create: required argument 'GuardianURL' not found");
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

        return dynamoDB.getByOwner(ownerEmail);
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

async function validateCreate(body, cognitoUsername, ownerEmail) {
    validateBodyCreate(body);
    try {
        return await validateLimitsCreate(cognitoUsername, ownerEmail);
    } catch (err) {
        throw err;
    }
}

async function validateRead(body) {
    validateBodyRead(body);
    return true;
}

async function validateUpdate(body) {
    validateBodyUpdate(body);
    return true;
}

async function validateDelete(body) {
    validateBodyDelete(body);
    return true;
}

function cleanDappName(name) {
    return name.toLowerCase().replace(/\s/g, '-').replace(/[^A-Za-z0-9-]/g, '')
}

function validateDbItemForOutput(dbItem) {
    assert(dbItem.hasOwnProperty('DappName'), "dbItem: required attribute 'DappName' not found");
    assert(dbItem.hasOwnProperty('OwnerEmail'), "dbItem: required attribute 'OwnerEmail' not found");
    assert(dbItem.hasOwnProperty('CreationTime'), "dbItem: required attribute 'CreationTime' not found");
    assert(dbItem.hasOwnProperty('DnsName'), "dbItem: required attribute 'DnsName' not found");
    assert(dbItem.hasOwnProperty('Abi'), "dbItem: required attribute 'Abi' not found");
    assert(dbItem.hasOwnProperty('ContractAddr'), "dbItem: required attribute 'ContractAddr' not found");
    assert(dbItem.hasOwnProperty('Web3URL'), "dbItem: required attribute 'Web3URL' not found");
    assert(dbItem.hasOwnProperty('GuardianURL'), "dbItem: required attribute 'GuardianURL' not found");

    assert(dbItem.DappName.hasOwnProperty('S'), "dbItem: required attribute 'DappName' has wrong shape");
    assert(dbItem.OwnerEmail.hasOwnProperty('S'), "dbItem: required attribute 'OwnerEmail' has wrong shape");
    assert(dbItem.CreationTime.hasOwnProperty('S'), "dbItem: required attribute 'CreationTime' has wrong shape");
    assert(dbItem.DnsName.hasOwnProperty('S'), "dbItem: required attribute 'DnsName' has wrong shape");
    assert(dbItem.Abi.hasOwnProperty('S'), "dbItem: required attribute 'Abi' has wrong shape");
    assert(dbItem.ContractAddr.hasOwnProperty('S'), "dbItem: required attribute 'ContractAddr' has wrong shape");
    assert(dbItem.Web3URL.hasOwnProperty('S'), "dbItem: required attribute 'Web3URL' has wrong shape");
    assert(dbItem.GuardianURL.hasOwnProperty('S'), "dbItem: required attribute 'GuardianURL' has wrong shape");
}

module.exports = {
    delete : validateDelete,
    create : validateCreate,
    read : validateRead,
    update : validateUpdate,
    cleanName: cleanDappName,
    dbItem: validateDbItemForOutput
}