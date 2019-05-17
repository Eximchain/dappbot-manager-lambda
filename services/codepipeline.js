const { addAwsPromiseRetries } = require('../common');
const { AWS, codebuildId, pipelineRoleArn, artifactBucket, dappseedBucket, lambdaFxnName } = require('../env');

const codepipeline = new AWS.CodePipeline();

function pipelineParams(dappName, pipelineName, destBucket, owner) {
    return {
        pipeline: {
            name: pipelineName,
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
                            "name": "Cleanup",
                            "actionTypeId": {
                                "category": "Invoke",
                                "owner": "AWS",
                                "version": "1",
                                "provider": "Lambda"
                            },
                            "runOrder":2,
                            "configuration": {
                                "FunctionName": lambdaFxnName,
                                "UserParameters": JSON.stringify({
                                    OwnerEmail: owner,
                                    DestinationBucket : destBucket,
                                    DappName : dappName
                                })
                            }
                        }
                    ]
                }
            ]
        }
    }
}

function promiseCreatePipeline(dappName, pipelineName, destBucket, owner) {
    let maxRetries = 5;
    let params = pipelineParams(dappName, pipelineName, destBucket, owner);
    return addAwsPromiseRetries(() => codepipeline.createPipeline(params).promise(), maxRetries);
}

function promiseRunPipeline(pipelineName) {
    let maxRetries = 5;
    let params = {
        name: pipelineName
    };
    return addAwsPromiseRetries(() => codepipeline.startPipelineExecution(params).promise(), maxRetries);
}

function promiseDeletePipeline(pipelineName) {
    let maxRetries = 5;
    let params = {
        name: pipelineName
    };
    return addAwsPromiseRetries(() => codepipeline.deletePipeline(params).promise(), maxRetries);
}

function promiseCompleteJob(jobId) {
    let maxRetries = 5;
    let params = {
        jobId : jobId
    }
    return addAwsPromiseRetries(() => codepipeline.putJobSuccessResult(params).promise(), maxRetries);
}

function promiseFailJob(jobId, err) {
    let maxRetries = 5;
    let params = {
        jobId : jobId,
        failureDetails : {
            type : 'JobFailed',
            message : JSON.stringify(err)
        }
    }
    return addAwsPromiseRetries(() => codepipeline.putJobFailureResult(params).promise(), maxRetries);
}

module.exports = {
    create: promiseCreatePipeline,
    run: promiseRunPipeline,
    delete: promiseDeletePipeline,
    completeJob: promiseCompleteJob,
    failJob : promiseFailJob
}