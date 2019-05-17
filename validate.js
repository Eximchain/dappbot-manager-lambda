const { assertStateValid, assertPermission, throwInternalValidationError } = require('./errors');
const { cloudfront } = require('./services');

function validateStateCreate(dbResponse) {
    let dbItem = dbResponse.Item;
    assertStateValid(dbItem, "Dapp Not Found");
}

function validateStateUpdate(dbResponse) {
    let dbItem = dbResponse.Item;
    assertStateValid(dbItem, "Dapp Not Found");
}

function validateStateDelete(dbResponse) {
    let dbItem = dbResponse.Item;
    assertStateValid(dbItem, "Dapp Not Found");
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