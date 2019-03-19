'use strict';
 
exports.handler = async (event) => {
    console.log("request: " + JSON.stringify(event));
    let responseCode = 200;

    let resource = event.pathParameters.proxy;
    let body = null;
    let headers = null;
    if (event.body) {
        body = JSON.parse(event.body);
    }

    // TODO: Do Stuff

    // TODO: Replace with something useful or remove
    let responseHeaders = {"x-custom-header" : "my custom header value"};

    let responseBody = {
        resource: resource,
        body: body
    };
    
    let response = {
        statusCode: responseCode,
        headers: responseHeaders,
        body: JSON.stringify(responseBody)
    };

    console.log("response: " + JSON.stringify(response))
    return response;
};