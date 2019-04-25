const { cognito } = require('./services');

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

async function validateLimitsCreate(cognitoUsername) {
    console.log("Validating Limits for User", cognitoUsername);
    return cognito.getUser(cognitoUsername).then(function(result) {
        console.log("Found Cognito User", result);
        return result;
    })
    .catch(function(err) {
        console.log("Error Validating Limit", err);
        throw err;
    })
}

async function validateCreate(body, cognitoUsername) {
    validateBodyCreate(body);
    try {
        return await validateLimitsCreate(cognitoUsername);
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