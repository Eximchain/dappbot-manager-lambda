'use strict';
const api = require('./api');
const cleanup = require('./services/cleanup');

exports.handler = async (event) => {
    console.log("request: " + JSON.stringify(event));

    // Pass CodePipeline events straight to cleanup function
    if (event['CodePipeline.job']){
        return cleanup.postPipelineCleanup(event['CodePipeline.job']);
    }

    let record = event.Records[0];

    let method = record.messageAttributes.Method.stringValue;
    let body = JSON.parse(record.body);
    let dappName = body.DappName;


    let processRecordPromise = (async function(method) {
        switch(method) {
            case 'create':
                return api.create(dappName);
            case 'update':
                return api.update(dappName);
            case 'delete':
                return api.delete(dappName);
            default:
                return Promise.reject({message: "Unrecognized method name ".concat(method)});
        }
    })(method);

    try {
        let result = await processRecordPromise;
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