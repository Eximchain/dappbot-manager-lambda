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

function validateCreate(body) {
    validateBodyCreate(body);
}

function validateDelete(body) {
    validateBodyDelete(body);
}

function validateRead(body) {
    validateBodyRead(body);
}

module.exports = {
    delete : validateDelete,
    create : validateCreate,
    read : validateRead
}