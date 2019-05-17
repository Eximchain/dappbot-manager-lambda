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


    let responsePromise = (async function(method) {
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

    let response;
    try {
        response = await responsePromise;
    } catch (err) {
        response = api.errorResponse(err);
    }
    return response;
};