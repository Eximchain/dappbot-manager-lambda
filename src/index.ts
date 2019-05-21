'use strict';
import processor from './processor';
import cleanup from './services/cleanup';
import { SQSEvent, CodePipelineEvent } from './lambda-event-types';
import { ResponseOptions } from './common';

type Event = SQSEvent | CodePipelineEvent;

exports.handler = async (event:Event) => {
    console.log("request: " + JSON.stringify(event));

    // Pass CodePipeline events straight to cleanup function
    if ('CodePipeline.job' in event){
        return cleanup.postPipelineCleanup(event['CodePipeline.job']);
    }

    // TODO: Handle multiple records
    let record = event.Records[0];

    let method = record.messageAttributes.Method.stringValue;
    let body = JSON.parse(record.body);
    let dappName = body.DappName;


    let processRecordPromise = (async function(method) {
        switch(method) {
            case 'create':
                return processor.create(dappName);
            case 'update':
                return processor.update(dappName);
            case 'delete':
                return processor.delete(dappName);
            default:
                return Promise.reject({message: `Unrecognized method name ${method}`});
        }
    })(method);

    try {
        let result = await processRecordPromise;
        return successResponse(result);
    } catch (err) {
        throw errorResponse(err);
    }
};

function response(result:any, opts:ResponseOptions) {
    if (opts.isErr) {
        console.log("Returning Error Response for result", result);
        throw {};
    } else {
        console.log("Returning Success Response for result", result);
        return {};
    }
}

function successResponse(result:any, opts:ResponseOptions={isCreate: false}) {
    let successOpt = {isErr: false};
    let callOpts = {...opts, ...successOpt};
    return response(result, callOpts);
}

function errorResponse(result:any, opts:ResponseOptions={isCreate: false}) {
    let errorOpt = {isErr: true};
    let callOpts = {...opts, ...errorOpt};
    return response(result, callOpts);
}