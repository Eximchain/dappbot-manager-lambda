'use strict';
 
exports.handler = async (event) => {
    console.log("request: " + JSON.stringify(event));
    let responseCode = 200;

    let path = event.path;
    let body = null;
    let headers = null;
    if (event.body) {
        body = JSON.parse(event.body);
    }
    if (event.headers) {
        headers = JSON.parse(event.headers);
    }

    // TODO: Do Stuff

    let responseHeaders = {"x-custom-header" : "my custom header value"};

    let responseBody = {
        path: path,
        body: body,
        headers: headers,
        input: event
    };
    
    let response = {
        statusCode: responseCode,
        headers: responseHeaders,
        body: JSON.stringify(responseBody)
    };

    console.log("response: " + JSON.stringify(response))
    return response;
};