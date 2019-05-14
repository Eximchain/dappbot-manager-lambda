const { addAwsPromiseRetries } = require('../common');
const { AWS, codebuildId, pipelineRoleArn, dnsRoot, artifactBucket, dappseedBucket, lambdaFxnName } = require('../env');

const codepipeline = new AWS.CodePipeline();

function pipelineName(dappName) {
  return `${dappName}${dnsRoot}`
}

function pipelineParams(dappName, destBucket, owner, distroId) {
    return {
        pipeline: {
            name: pipelineName(dappName),
            roleArn: pipelineRoleArn,
            version: 1,
            artifactStore: {
                location: artifactBucket,
                type: 'S3'
            },
            stages: [
                {
                    "name": "FetchDappseed",
                    "actions": [
                        {
                            "inputArtifacts": [],
                            "name": "Source",
                            "actionTypeId": {
                                "category": "Source",
                                "owner": "AWS",
                                "version": "1",
                                "provider": "S3"
                            },
                            "outputArtifacts": [
                                {
                                    "name": "DAPPSEED"
                                }
                            ],
                            "configuration": {
                                "S3Bucket": dappseedBucket,
                                "S3ObjectKey": `${dappName}/dappseed.zip`
                            },
                            "runOrder": 1
                        }
                    ]
                },
                {
                    "name": "BuildDapp",
                    "actions": [
                        {
                            "inputArtifacts": [
                                {
                                    "name": "DAPPSEED"
                                }
                            ],
                            "name": "Build",
                            "actionTypeId": {
                                "category": "Build",
                                "owner": "AWS",
                                "version": "1",
                                "provider": "CodeBuild"
                            },
                            "outputArtifacts": [
                                {
                                    "name": "BUILD"
                                }
                            ],
                            "configuration": {
                                "ProjectName": codebuildId
                            },
                            "runOrder": 1
                        }
                    ]
                },
                {
                    "name": "DeployToS3",
                    "actions": [
                        {
                            "inputArtifacts": [
                                {
                                    "name": "BUILD"
                                }
                            ],
                            "name": "Deploy",
                            "actionTypeId": {
                                "category": "Deploy",
                                "owner": "AWS",
                                "version": "1",
                                "provider": "S3"
                            },
                            "runOrder": 1,
                            "configuration": {
                                "BucketName" : destBucket,
                                "Extract": "true"
                            }
                        },
                        {
                            "inputArtifacts": [
                                {
                                    "name": "DAPPSEED"
                                }
                            ],
                            "name": "Cleanup",
                            "actionTypeId": {
                                "category": "Invoke",
                                "owner": "AWS",
                                "version": "1",
                                "configuration": {
                                    "FunctionName": lambdaFxnName,
                                    "UserParameters": JSON.stringify({
                                        OwnerEmail: owner,
                                        DistributionId: distroId
                                    })
                                }
                            },
                            "runOrder":2,
                            "configuration": {

                            }
                        }
                    ]
                }
            ]
        }
    }
}

function promiseCreatePipeline(dappName, destBucket, owner, distroId) {
    let maxRetries = 5;
    let params = pipelineParams(dappName, destBucket, owner, distroId);
    return addAwsPromiseRetries(() => codepipeline.createPipeline(params).promise(), maxRetries);
}

function promiseRunPipeline(dappName) {
    let maxRetries = 5;
    let params = {
        name: pipelineName(dappName)
    };
    return addAwsPromiseRetries(() => codepipeline.startPipelineExecution(params).promise(), maxRetries);
}

function promiseDeletePipeline(dappName) {
    let maxRetries = 5;
    let params = {
        name: pipelineName(dappName)
    };
    return addAwsPromiseRetries(() => codepipeline.deletePipeline(params).promise(), maxRetries);
}

module.exports = {
    create: promiseCreatePipeline,
    run: promiseRunPipeline,
    delete: promiseDeletePipeline,
    pipelineName: pipelineName
}