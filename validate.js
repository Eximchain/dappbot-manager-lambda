const { assertStateValid, assertPermission, throwInternalValidationError } = require('./errors');
const { cloudfront } = require('./services');

const ALLOWED_OPERATIONS_BY_STATE = {
    CREATING: new Set(['create', 'update', 'delete']),
    BUILDING_DAPP: new Set(['update', 'delete']),
    AVAILABLE: new Set(['update', 'delete']),
    DELETING: new Set(['delete']),
    FAILED: new Set(['update', 'delete']),
    DEPOSED: new Set(['delete'])
};

function allowedOpFromState(operation, state) {
    return ALLOWED_OPERATIONS_BY_STATE[state].has(operation);
}

function validateStateCreate(dbResponse) {
    const operation = 'create';

    let dbItem = dbResponse.Item;
    assertStateValid(dbItem, `Dapp Not Found for ${operation} operation`);

    assertStateValid(dbItem.hasOwnProperty('DappName'), "dbItem: required attribute 'DappName' not found");
    assertStateValid(dbItem.hasOwnProperty('OwnerEmail'), "dbItem: required attribute 'OwnerEmail' not found");
    assertStateValid(dbItem.hasOwnProperty('DnsName'), "dbItem: required attribute 'DnsName' not found");
    assertStateValid(dbItem.hasOwnProperty('PipelineName'), "dbItem: required attribute 'PipelineName' not found");
    assertStateValid(dbItem.hasOwnProperty('Abi'), "dbItem: required attribute 'Abi' not found");
    assertStateValid(dbItem.hasOwnProperty('ContractAddr'), "dbItem: required attribute 'ContractAddr' not found");
    assertStateValid(dbItem.hasOwnProperty('Web3URL'), "dbItem: required attribute 'Web3URL' not found");
    assertStateValid(dbItem.hasOwnProperty('GuardianURL'), "dbItem: required attribute 'GuardianURL' not found");
    assertStateValid(dbItem.hasOwnProperty('State'), "dbItem: required attribute 'State' not found");

    assertStateValid(dbItem.DappName.hasOwnProperty('S'), "dbItem: required attribute 'DappName' has wrong shape");
    assertStateValid(dbItem.OwnerEmail.hasOwnProperty('S'), "dbItem: required attribute 'OwnerEmail' has wrong shape");
    assertStateValid(dbItem.DnsName.hasOwnProperty('S'), "dbItem: required attribute 'DnsName' has wrong shape");
    assertStateValid(dbItem.PipelineName.hasOwnProperty('S'), "dbItem: required attribute 'PipelineName' has wrong shape");
    assertStateValid(dbItem.Abi.hasOwnProperty('S'), "dbItem: required attribute 'Abi' has wrong shape");
    assertStateValid(dbItem.ContractAddr.hasOwnProperty('S'), "dbItem: required attribute 'ContractAddr' has wrong shape");
    assertStateValid(dbItem.Web3URL.hasOwnProperty('S'), "dbItem: required attribute 'Web3URL' has wrong shape");
    assertStateValid(dbItem.GuardianURL.hasOwnProperty('S'), "dbItem: required attribute 'GuardianURL' has wrong shape");
    assertStateValid(dbItem.State.hasOwnProperty('S'), "dbItem: required attribute 'State' has wrong shape");

    let state = dbItem.State.S;
    assertPermission(allowedOpFromState(operation, state), `'${operation}' operation prohibited from state '${state}'`);
}

function validateStateUpdate(dbResponse) {
    const operation = 'update';

    let dbItem = dbResponse.Item;
    assertStateValid(dbItem, `Dapp Not Found for ${operation} operation`);

    assertStateValid(dbItem.hasOwnProperty('DappName'), "dbItem: required attribute 'DappName' not found");
    assertStateValid(dbItem.hasOwnProperty('OwnerEmail'), "dbItem: required attribute 'OwnerEmail' not found");
    assertStateValid(dbItem.hasOwnProperty('DnsName'), "dbItem: required attribute 'DnsName' not found");
    assertStateValid(dbItem.hasOwnProperty('CloudfrontDnsName'), "dbItem: required attribute 'CloudfrontDnsName' not found");
    assertStateValid(dbItem.hasOwnProperty('PipelineName'), "dbItem: required attribute 'PipelineName' not found");
    assertStateValid(dbItem.hasOwnProperty('Abi'), "dbItem: required attribute 'Abi' not found");
    assertStateValid(dbItem.hasOwnProperty('ContractAddr'), "dbItem: required attribute 'ContractAddr' not found");
    assertStateValid(dbItem.hasOwnProperty('Web3URL'), "dbItem: required attribute 'Web3URL' not found");
    assertStateValid(dbItem.hasOwnProperty('GuardianURL'), "dbItem: required attribute 'GuardianURL' not found");
    assertStateValid(dbItem.hasOwnProperty('State'), "dbItem: required attribute 'State' not found");

    assertStateValid(dbItem.DappName.hasOwnProperty('S'), "dbItem: required attribute 'DappName' has wrong shape");
    assertStateValid(dbItem.OwnerEmail.hasOwnProperty('S'), "dbItem: required attribute 'OwnerEmail' has wrong shape");
    assertStateValid(dbItem.DnsName.hasOwnProperty('S'), "dbItem: required attribute 'DnsName' has wrong shape");
    assertStateValid(dbItem.CloudfrontDnsName.hasOwnProperty('S'), "dbItem: required attribute 'CloudfrontDnsName' has wrong shape");
    assertStateValid(dbItem.PipelineName.hasOwnProperty('S'), "dbItem: required attribute 'PipelineName' has wrong shape");
    assertStateValid(dbItem.Abi.hasOwnProperty('S'), "dbItem: required attribute 'Abi' has wrong shape");
    assertStateValid(dbItem.ContractAddr.hasOwnProperty('S'), "dbItem: required attribute 'ContractAddr' has wrong shape");
    assertStateValid(dbItem.Web3URL.hasOwnProperty('S'), "dbItem: required attribute 'Web3URL' has wrong shape");
    assertStateValid(dbItem.GuardianURL.hasOwnProperty('S'), "dbItem: required attribute 'GuardianURL' has wrong shape");
    assertStateValid(dbItem.State.hasOwnProperty('S'), "dbItem: required attribute 'State' has wrong shape");

    let state = dbItem.State.S;
    assertPermission(allowedOpFromState(operation, state), `'${operation}' operation prohibited from state '${state}'`);
}

function validateStateDelete(dbResponse) {
    const operation = 'delete';

    let dbItem = dbResponse.Item;
    assertStateValid(dbItem, `Dapp Not Found for ${operation} operation`);

    assertStateValid(dbItem.hasOwnProperty('DappName'), "dbItem: required attribute 'DappName' not found");
    assertStateValid(dbItem.hasOwnProperty('OwnerEmail'), "dbItem: required attribute 'OwnerEmail' not found");
    assertStateValid(dbItem.hasOwnProperty('DnsName'), "dbItem: required attribute 'DnsName' not found");
    assertStateValid(dbItem.hasOwnProperty('CloudfrontDnsName'), "dbItem: required attribute 'CloudfrontDnsName' not found");
    assertStateValid(dbItem.hasOwnProperty('PipelineName'), "dbItem: required attribute 'PipelineName' not found");
    assertStateValid(dbItem.hasOwnProperty('CloudfrontDistributionId'), "dbItem: required attribute 'CloudfrontDistributionId' not found");
    assertStateValid(dbItem.hasOwnProperty('S3BucketName'), "dbItem: required attribute 'S3BucketName' not found");
    assertStateValid(dbItem.hasOwnProperty('State'), "dbItem: required attribute 'State' not found");

    assertStateValid(dbItem.DappName.hasOwnProperty('S'), "dbItem: required attribute 'DappName' has wrong shape");
    assertStateValid(dbItem.OwnerEmail.hasOwnProperty('S'), "dbItem: required attribute 'OwnerEmail' has wrong shape");
    assertStateValid(dbItem.DnsName.hasOwnProperty('S'), "dbItem: required attribute 'DnsName' has wrong shape");
    assertStateValid(dbItem.CloudfrontDnsName.hasOwnProperty('S'), "dbItem: required attribute 'CloudfrontDnsName' has wrong shape");
    assertStateValid(dbItem.PipelineName.hasOwnProperty('S'), "dbItem: required attribute 'PipelineName' has wrong shape");
    assertStateValid(dbItem.CloudfrontDistributionId.hasOwnProperty('S'), "dbItem: required attribute 'CloudfrontDistributionId' has wrong shape");
    assertStateValid(dbItem.S3BucketName.hasOwnProperty('S'), "dbItem: required attribute 'S3BucketName' has wrong shape");
    assertStateValid(dbItem.State.hasOwnProperty('S'), "dbItem: required attribute 'State' has wrong shape");

    let state = dbItem.State.S;
    assertPermission(allowedOpFromState(operation, state), `'${operation}' operation prohibited from state '${state}'`);
}

async function validateConflictingDistributionRepurposable(conflictingDistro, owner) {
    if (!conflictingDistro) {
        console.log("UNEXPECTED ERROR: Conflicting distro not found despite 'CNAMEAlreadyExists' error");
        throwInternalValidationError();
    }

    let conflictingDistroArn = conflictingDistro.ARN;
    let existingDappOwner;
    try {
        existingDappOwner = await cloudfront.getDistroOwner(conflictingDistroArn);
    } catch (err) {
        console.log("UNEXPECTED ERROR: Conuld not retrieve owner of existing Dapp");
        throwInternalValidationError();
    }
                        
    // Don't let the caller take someone else's distribution
    assertPermission(owner === existingDappOwner, "Cannot repurpose distribution that belongs to another user");
}

module.exports = {
    stateCreate : validateStateCreate,
    stateUpdate : validateStateUpdate,
    stateDelete : validateStateDelete,
    conflictingDistroRepurposable : validateConflictingDistributionRepurposable
}