'use strict';
import Dapp from '@eximchain/dappbot-types/spec/dapp';
import { successResponse, unexpectedErrorResponse } from '@eximchain/dappbot-types/spec/responses';
import processor from './processor';
import { SQSEvent, SQSRecord } from './lambda-event-types';

// Main Queue

function methodProcessor(method:Dapp.Operations) {
    switch(method) {
        case 'create':
            return processor.create;
        case 'update':
            return processor.update;
        case 'delete':
            return processor.delete;
        default:
            return (dappName:string) => Promise.reject({message: `Unrecognized method name ${method} for processing '${dappName}'`});
    }
}

async function processRecord(record:SQSRecord) {
    let method = record.messageAttributes.Method.stringValue as Dapp.Operations;
    let body = JSON.parse(record.body);
    let dappName = body.DappName;

    let recordProcessor = methodProcessor(method);
    return recordProcessor(dappName);
}

exports.handler = async (event:SQSEvent) => {
    console.log("request: " + JSON.stringify(event));

    let records = event.Records;
    let processRecordsPromise = Promise.all(records.map(processRecord));

    try {
        let result = await processRecordsPromise;
        return successResponse(result);
    } catch (err) {
        throw unexpectedErrorResponse(err);
    }
};

// Dead Letter Queue

function deadLetterProcessor(method:Dapp.Operations) {
    switch(method) {
        case 'create':
            return processor.fail;
        case 'update':
            return processor.fail;
        case 'delete':
            return processor.depose;
        default:
            return (dappName:string) => Promise.reject({message: `Unrecognized method name ${method} for processing '${dappName}'`});
    }
}

async function processDeadLetter(record:SQSRecord) {
    let method = record.messageAttributes.Method.stringValue as Dapp.Operations;
    let body = JSON.parse(record.body);
    let dappName = body.DappName;

    let recordProcessor = deadLetterProcessor(method);
    return recordProcessor(dappName);
}

exports.deadLetterHandler = async (event:SQSEvent) => {
    console.log("dead letter: " + JSON.stringify(event));

    let records = event.Records;
    let processRecordsPromise = Promise.all(records.map(processDeadLetter));

    try {
        let result = await processRecordsPromise;
        return successResponse(result);
    } catch (err) {
        throw unexpectedErrorResponse(err);
    }
};