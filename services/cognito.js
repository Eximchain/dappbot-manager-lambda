const { AWS, cognitoUserPoolId } = require('../env');
const cognito = new AWS.CognitoIdentityServiceProvider({apiVersion: '2016-04-18'});

function promiseAdminGetUser(cognitoUsername) {
    let params = {
        UserPoolId: cognitoUserPoolId,
        Username: cognitoUsername
    };
    return cognito.adminGetUser(params).promise();
}

module.exports = {
    getUser : promiseAdminGetUser
}