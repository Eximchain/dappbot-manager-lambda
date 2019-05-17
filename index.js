'use strict';
const processor = require('./processor');
const cleanup = require('./services/cleanup');

function methodProcessor(method) {
    switch(method) {
        case 'create':
            return processor.create;
        case 'update':
            return processor.update;
        case 'delete':
            return processor.delete;
        default:
            return (dappName) => Promise.reject({message: `Unrecognized method name ${method} for processing '${dappName}'`});
    }
}

async function processRecord(record) {
    let method = record.messageAttributes.Method.stringValue;
    let body = JSON.parse(record.body);
    let dappName = body.DappName;

    let recordProcessor = methodProcessor(method);
    return recordProcessor(dappName);
}

exports.handler = async (event) => {
    console.log("request: " + JSON.stringify(event));

    // Pass CodePipeline events straight to cleanup function
    if (event['CodePipeline.job']){
        return cleanup.postPipelineCleanup(event['CodePipeline.job']);
    }

    let records = event.Records;
    let processRecordsPromise = Promise.all(records.map(processRecord));

    try {
        let result = await processRecordsPromise;
        return successResponse(result);
    } catch (err) {
        throw errorResponse(err);
    }
};

function response(result, opts) {
    if (opts.isErr) {
        console.log("Returning Error Response for result", result);
        throw {};
    } else {
        console.log("Returning Success Response for result", result);
        return {};
    }
}

function successResponse(result, opts={isCreate: false}) {
    let successOpt = {isErr: false};
    let callOpts = {...opts, ...successOpt};
    return response(result, callOpts);
}

function errorResponse(result, opts={isCreate: false}) {
    let errorOpt = {isErr: true};
    let callOpts = {...opts, ...errorOpt};
    return response(result, callOpts);
}