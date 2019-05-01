const defaultTags = [
    {
        Key: "Application",
        Value: "AbiClerk"
    },
    {
        Key: "ManagedBy",
        Value: "AbiClerk"
    }
];

function dappNameTag(dappName) {
    return {
        Key: "DappName",
        Value: dappName
    }
}

function rejectDelay(reason) {
    let t = 500;
    return new Promise(function(resolve, reject) {
        setTimeout(reject.bind(null, reason), t); 
    });
}

function retryPromise(promiseGenerator, maxRetries) {
    let p = Promise.reject({retryable: true});

    for(var i=0; i<maxRetries; i++) {
        p = p.catch(err => err.retryable ? promiseGenerator() : Promise.reject(err))
             .catch(err => err.retryable ? rejectDelay(err) : Promise.reject(err));
    }
    return p;
}

module.exports = { 
    defaultTags, dappNameTag, retryPromise
};