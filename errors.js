// CUSTOM ERROR TYPES

class ProcessingError {
    constructor(message) {
        this.name = "ProcessingError";
        this.message = message;
    }
}

class StateValidationError extends ProcessingError {
    constructor(message) {
        super(message);
        this.name = "StateValidationError";
    }
}

class PermissionError extends ProcessingError {
    constructor(message) {
        super(message);
        this.name = "PermissionError";
    }
}

class InternalProcessingError extends ProcessingError {
    constructor(message) {
        super(message);
        this.name = "InternalProcessingError";
    }
}

// ASSERT METHODS

function assert(condition, message, errorType=ProcessingError) {
    if (!condition) {
        throw new errorType(message);
    }
}

function assertStateValid(condition, message) {
    return assert(condition, message, StateValidationError);
}

function assertPermission(condition, message) {
    return assert(condition, message, PermissionError);
}

function assertInternal(condition) {
    let message = "Internal error during processing";
    return assert(condition, message, InternalProcessingError);
}

function throwInternalValidationError() {
    return assertInternal(false);
}

module.exports = {
    assertStateValid : assertStateValid,
    assertPermission : assertPermission,
    assertInternal : assertInternal,
    throwInternalValidationError : throwInternalValidationError
}