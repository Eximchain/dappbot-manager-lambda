const { assertStateValid, assertPermission, throwInternalValidationError } = require('./errors');
const { cloudfront } = require('./services');

const OPERATION_HANDLING_BY_STATE = {
    CREATING: {
        'create': 'process',
        'update': 'retry',
        'delete': 'process'
    },
    BUILDING_DAPP: {
        'create': 'ignore',
        'update': 'process',
        'delete': 'process'
    },
    AVAILABLE: {
        'create': 'ignore',
        'update': 'process',
        'delete': 'process'
    },
    DELETING: {
        'create': 'ignore',
        'update': 'ignore',
        'delete': 'process'
    },
    FAILED: {
        'create': 'ignore',
        'update': 'ignore',
        'delete': 'process'
    },
    DEPOSED: {
        'create': 'ignore',
        'update': 'ignore',
        'delete': 'process'
    }
};

/*
- This function throws an error if processing should be delayed but retried
- Returns true if the operation should be processed
- Returns false otherwise
*/
function processOpFromState(operation, state) {
    let directive = OPERATION_HANDLING_BY_STATE[state][operation];
    assertPermission(directive !== 'retry', `'${operation}' operation prohibited from state '${state}'. Failing processing and retrying after visibility timeout.`);
    return directive == 'process';
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
    return processOpFromState(operation, state);
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
    return processOpFromState(operation, state);
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
    return processOpFromState(operation, state);
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