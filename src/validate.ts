import { assertStateValid, assertPermission, throwInternalValidationError } from './errors';
import { DappOperations as dappOps, DappStates } from './common';
import cloudfront from './services/cloudfront';
import { GetItemOutput } from 'aws-sdk/clients/dynamodb';
import { DistributionSummary } from 'aws-sdk/clients/cloudfront';

const ALLOWED_OPERATIONS_BY_STATE = {
    CREATING: [dappOps.create, dappOps.update, dappOps.delete],
    BUILDING_DAPP: [dappOps.update, dappOps.delete],
    AVAILABLE: [dappOps.update, dappOps.delete],
    DELETING: [dappOps.delete],
    FAILED: [dappOps.update, dappOps.delete],
    DEPOSED: [dappOps.delete]
};

function allowedOpFromState(operation:dappOps, state:DappStates) {
    return ALLOWED_OPERATIONS_BY_STATE[state].includes(operation);
}

function validateStateCreate(dbResponse:GetItemOutput) {
    const operation = dappOps.create;

    let dbItem = dbResponse.Item;
    // Use a direct check so the TS compiler understands that beyond this line,
    // dbItem is definitely defined.  Same in fxns below.
    if (!dbItem) throw new Error(`Dapp Not Found for ${operation} operation`)

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

    let state = dbItem.State.S as DappStates;
    assertPermission(allowedOpFromState(operation, state), `'${operation}' operation prohibited from state '${state}'`);
}

function validateStateUpdate(dbResponse:GetItemOutput) {
    const operation = dappOps.update;

    let dbItem = dbResponse.Item;
    if (!dbItem) throw new Error(`Dapp Not Found for ${operation} operation`)

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

    let state = dbItem.State.S as DappStates;
    assertPermission(allowedOpFromState(operation, state), `'${operation}' operation prohibited from state '${state}'`);
}

function validateStateDelete(dbResponse:GetItemOutput) {
    const operation = dappOps.delete;

    let dbItem = dbResponse.Item;
    if (!dbItem) throw new Error(`Dapp Not Found for ${operation} operation`)

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

    let state = dbItem.State.S as DappStates;
    assertPermission(allowedOpFromState(operation, state), `'${operation}' operation prohibited from state '${state}'`);
}

type MaybeDistro = DistributionSummary | null;
async function validateConflictingDistributionRepurposable(conflictingDistro:MaybeDistro, owner:string) {
    if (!conflictingDistro) {
        console.log("UNEXPECTED ERROR: Conflicting distro not found despite 'CNAMEAlreadyExists' error");
        throwInternalValidationError();
    }

    // @ts-ignore Typescript doesn't know custom throw prevents execution from
    // reaching this point if that value isn't present, so tell the compiler
    // to be quiet.
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

export default {
    stateCreate : validateStateCreate,
    stateUpdate : validateStateUpdate,
    stateDelete : validateStateDelete,
    conflictingDistroRepurposable : validateConflictingDistributionRepurposable
}