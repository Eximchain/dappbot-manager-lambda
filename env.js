const awsRegion = process.env.AWS_REGION;
const tableName = process.env.DDB_TABLE;
const r53HostedZoneId = process.env.R53_HOSTED_ZONE_ID;
const dnsRoot = process.env.DNS_ROOT;
const codebuildId = process.env.CODEBUILD_ID;
const pipelineRoleArn = process.env.PIPELINE_ROLE_ARN;
const kmsKeyName = process.env.KMS_KEY_NAME;
const artifactBucket = process.env.ARTIFACT_BUCKET;
const dappseedBucket = process.env.DAPPSEED_BUCKET;
const cognitoUserPoolId = process.env.COGNITO_USER_POOL;

const AWS = require('aws-sdk');
AWS.config.update({region: awsRegion});

module.exports = { 
    AWS, awsRegion, tableName, r53HostedZoneId, dnsRoot, codebuildId, 
    pipelineRoleArn, kmsKeyName, artifactBucket, dappseedBucket, cognitoUserPoolId
};