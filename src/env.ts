// Provided automagically by AWS
export const awsRegion = process.env.AWS_REGION as string;
export const lambdaFxnName = process.env.AWS_LAMBDA_FUNCTION_NAME as string;

// Provided to us via Terraform
export const tableName = process.env.DDB_TABLE as string;
export const r53HostedZoneId = process.env.R53_HOSTED_ZONE_ID as string;
export const dnsRoot = process.env.DNS_ROOT as string;
export const codebuildId = process.env.CODEBUILD_ID as string;
export const codebuildGenerateId = process.env.CODEBUILD_GENERATE_ID as string;
export const codebuildBuildId = process.env.CODEBUILD_BUILD_ID as string;
export const pipelineRoleArn = process.env.PIPELINE_ROLE_ARN as string;
export const kmsKeyName = process.env.KMS_KEY_NAME as string;
export const artifactBucket = process.env.ARTIFACT_BUCKET as string;
export const dappseedBucket = process.env.DAPPSEED_BUCKET as string;
export const wildcardCertArn = process.env.WILDCARD_CERT_ARN as string;
export const cognitoUserPoolId = process.env.COGNITO_USER_POOL as string;
export const sendgridApiKey = process.env.SENDGRID_API_KEY as string;
export const servicesLambdaFxnName = process.env.SERVICES_LAMBDA_FUNCTION as string;
export const githubToken = process.env.GITHUB_TOKEN as string;

import AWSUnconfigured from 'aws-sdk';
export const AWS = AWSUnconfigured;
AWS.config.update({region: awsRegion});

export default { 
    AWS, awsRegion, tableName, r53HostedZoneId, dnsRoot, codebuildId, codebuildGenerateId, codebuildBuildId,
    lambdaFxnName, pipelineRoleArn, kmsKeyName, artifactBucket, 
    dappseedBucket, wildcardCertArn, cognitoUserPoolId, sendgridApiKey, servicesLambdaFxnName
};