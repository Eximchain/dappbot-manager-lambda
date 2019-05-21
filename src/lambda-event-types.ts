// API Gateway "event" request context
export interface APIGatewayEventRequestContext {
  accountId: string;
  apiId: string;
  authorizer?: AuthResponseContext | null;
  connectedAt?: number;
  connectionId?: string;
  domainName?: string;
  eventType?: string;
  extendedRequestId?: string;
  httpMethod: string;
  identity: {
      accessKey: string | null;
      accountId: string | null;
      apiKey: string | null;
      apiKeyId: string | null;
      caller: string | null;
      cognitoAuthenticationProvider: string | null;
      cognitoAuthenticationType: string | null;
      cognitoIdentityId: string | null;
      cognitoIdentityPoolId: string | null;
      sourceIp: string;
      user: string | null;
      userAgent: string | null;
      userArn: string | null;
  };
  messageDirection?: string;
  messageId?: string | null;
  path: string;
  stage: string;
  requestId: string;
  requestTime?: string;
  requestTimeEpoch: number;
  resourceId: string;
  resourcePath: string;
  routeKey?: string;
}

// API Gateway "event"
export interface APIGatewayProxyEvent {
  body: string | null;
  headers: { [name: string]: string };
  multiValueHeaders: { [name: string]: string[] };
  httpMethod: string;
  isBase64Encoded: boolean;
  path: string;
  pathParameters: { [name: string]: string } | null;
  queryStringParameters: { [name: string]: string } | null;
  multiValueQueryStringParameters: { [name: string]: string[] } | null;
  stageVariables: { [name: string]: string } | null;
  requestContext: APIGatewayEventRequestContext;
  resource: string;
}
export type APIGatewayEvent = APIGatewayProxyEvent; // Old name

export interface AuthResponseContext {
  [name: string]: any;
}

/**
 * CodePipeline events
 * https://docs.aws.amazon.com/codepipeline/latest/userguide/actions-invoke-lambda-function.html
 */
export interface S3ArtifactLocation {
  bucketName: string;
  objectKey: string;
}
export interface S3ArtifactStore {
  type: 'S3';
  s3Location: S3ArtifactLocation;
}

export type ArtifactLocation = S3ArtifactStore;

export interface Artifact {
  name: string;
  revision: string | null;
  location: ArtifactLocation;
}

export interface Credentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
}

export interface EncryptionKey {
  type: string;
  id: string;
}

export interface CodePipelineJob {
  id: string;
  accountId: string;
  data: {
      actionConfiguration: {
          configuration: {
              FunctionName: string;
              UserParameters: string;
          }
      };
      inputArtifacts: Artifact[];
      outputArtifacts: Artifact[];
      artifactCredentials: Credentials;
      encryptionKey?: EncryptionKey & { type: 'KMS' };
      continuationToken?: string;
  };
};

export interface CodePipelineEvent {
  "CodePipeline.job": CodePipelineJob
};