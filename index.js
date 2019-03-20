'use strict';

var AWS = require('aws-sdk');

AWS.config.update({region: process.env.AWS_REGION});

var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
var tableName = process.env.DDB_TABLE;

async function apiCreate(body) {
    return new Promise(function(resolve, reject) {
        try {
            validateBodyCreate(body);
        } catch(err) {
            reject(err);
        }
        let key = body.key;
        let value = body.value;

        let putItemParams = {
            TableName: tableName,
            Item: serializeDdbItem(key, value)
        };

        let putItemPromise = ddb.putItem(putItemParams).promise();

        let responseCode = 200;
        // TODO: Replace with something useful or remove
        let responseHeaders = {"x-custom-header" : "my custom header value"};

        putItemPromise.then(
            function(result) {
                console.log("Put Item Success", result);
                let responseBody = {
                    method: "create",
                    body: body
                };
                let response = {
                    statusCode: responseCode,
                    headers: responseHeaders,
                    body: JSON.stringify(responseBody)
                };
                resolve(response);
            },
            function(err) {
                console.log("Error", err);
                reject(err);
            }
        );
    });
}

function validateBodyCreate(body) {
    if (!body.hasOwnProperty('key')) {
        throw new Error("create: required argument 'key' not found");
    }
    if (!body.hasOwnProperty('value')) {
        throw new Error("create: required argument 'value' not found");
    }
}

async function apiRead(body) {
    return new Promise(function(resolve, reject) {
        try {
            validateBodyRead(body);
        } catch(err) {
            reject(err);
        }
        let key = body.key;

        let getItemParams = {
            TableName: tableName,
            Key: serializeDdbKey(key)
        };

        let getItemPromise = ddb.getItem(getItemParams).promise();

        let responseCode = 200;
        // TODO: Replace with something useful or remove
        let responseHeaders = {"x-custom-header" : "my custom header value"};

        getItemPromise.then(
            function(result) {
                console.log("Get Item Success", result);
                let responseBody = {
                    method: "read",
                    item: result.Item,
                    body: body
                };
                let response = {
                    statusCode: responseCode,
                    headers: responseHeaders,
                    body: JSON.stringify(responseBody)
                };
                resolve(response);
            },
            function(err) {
                console.log("Error", err);
                reject(err);
            }
        );
    });
}

function validateBodyRead(body) {
    if (!body.hasOwnProperty('key')) {
        throw new Error("read: required argument 'key' not found");
    }
}

async function apiUpdate(body) {
    return new Promise(function(resolve, reject) {
        try {
            validateBodyUpdate(body);
        } catch(err) {
            reject(err);
        }
        let key = body.key;
        let value = body.value;

        let putItemParams = {
            TableName: tableName,
            Item: serializeDdbItem(key, value)
        };

        let putItemPromise = ddb.putItem(putItemParams).promise();

        let responseCode = 200;
        // TODO: Replace with something useful or remove
        let responseHeaders = {"x-custom-header" : "my custom header value"};

        putItemPromise.then(
            function(result) {
                console.log("Put Item Success", result);
                let responseBody = {
                    method: "update",
                    body: body
                };
                let response = {
                    statusCode: responseCode,
                    headers: responseHeaders,
                    body: JSON.stringify(responseBody)
                };
                resolve(response);
            },
            function(err) {
                console.log("Error", err);
                reject(err);
            }
        );
    });
}

function validateBodyUpdate(body) {
    if (!body.hasOwnProperty('key')) {
        throw new Error("update: required argument 'key' not found");
    }
    if (!body.hasOwnProperty('value')) {
        throw new Error("update: required argument 'value' not found");
    }
}

async function apiDelete(body) {
    return new Promise(function(resolve, reject) {
        try {
            validateBodyDelete(body);
        } catch(err) {
            reject(err);
        }
        let key = body.key;

        let deleteItemParams = {
            TableName: tableName,
            Key: serializeDdbKey(key)
        };

        let deleteItemPromise = ddb.deleteItem(deleteItemParams).promise();

        let responseCode = 200;
        // TODO: Replace with something useful or remove
        let responseHeaders = {"x-custom-header" : "my custom header value"};

        deleteItemPromise.then(
            function(result) {
                console.log("Delete Item Success", result);
                let responseBody = {
                    method: "delete",
                    body: body
                };
                let response = {
                    statusCode: responseCode,
                    headers: responseHeaders,
                    body: JSON.stringify(responseBody)
                };
                resolve(response);
            },
            function(err) {
                console.log("Error", err);
                reject(err);
            }
        );
    });
}

function validateBodyDelete(body) {
    if (!body.hasOwnProperty('key')) {
        throw new Error("delete: required argument 'key' not found");
    }
}
 
exports.handler = async (event) => {
    console.log("request: " + JSON.stringify(event));
    let responseCode = 200;

    let method = event.pathParameters.proxy;
    let body = null;
    if (event.body) {
        body = JSON.parse(event.body);
    }

    let responsePromise = (function(method) {
        switch(method) {
            case 'create':
                return apiCreate(body);
            case 'read':
                return apiRead(body);
            case 'update':
                return apiUpdate(body);
            case 'delete':
                return apiDelete(body);
            default:
                throw new Error("Unrecognized method name ".concat(method));
        }
    })(method);

    let response = await responsePromise;
    return response;
};

function serializeDdbItem(key, value) {
    let item = {
        'Key' : {S: key},
        'Value' : {S: value}
    };
    return item;
}

function serializeDdbKey(key) {
    let keyItem = {
        'Key': {S: key}
    };
    return keyItem;
}