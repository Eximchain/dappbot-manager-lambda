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

    let responsePromise = (function(method) {
        switch(method) {
            case 'create':
                validate.create(body, authorizedUser);
                return api.create(body);
            case 'read':
                validate.read(body);
                return api.read(body);
            case 'delete':
                validate.delete(body);
                return api.delete(body);
            default:
                throw new Error("Unrecognized method name ".concat(method));
        }
    })(method);

    let response = await responsePromise;
    return response;
};