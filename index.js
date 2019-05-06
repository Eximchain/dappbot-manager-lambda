'use strict';
const api = require('./api');
const validate = require('./validate');

exports.handler = async (event) => {
    console.log("request: " + JSON.stringify(event));

    let method = event.pathParameters.proxy;
    let body = null;
    if (event.body) {
        body = JSON.parse(event.body);
    }
    let authorizedUser = event.requestContext.authorizer.claims["cognito:username"];
    let ownerEmail = event.requestContext.authorizer.claims.email;

    let responsePromise = (async function(method) {
        switch(method) {
            case 'create':
                await validate.create(body, authorizedUser, ownerEmail);
                console.log("Create validation passed");
                return api.create(body, ownerEmail);
            case 'read':
                await validate.read(body);
                return api.read(body);
            case 'update':
                await validate.update(body);
                return api.update(body, ownerEmail);
            case 'delete':
                await validate.delete(body);
                return api.delete(body);
            default:
                throw new Error("Unrecognized method name ".concat(method));
        }
    })(method);

    let response = await responsePromise;
    return response;
};