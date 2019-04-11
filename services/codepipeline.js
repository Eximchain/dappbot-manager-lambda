const { AWS, codebuildId, pipelineRoleArn, kmsKeyName, artifactBucket, dappseedBucket } = require('../env');

const codepipeline = new AWS.CodePipeline();

function pipelineName(dappName) {
  return `${dappName}-dapp`
}

function pipelineParams(dappName, destBucket) {
    return {
        pipeline: {
            name: pipelineName(dappName),
            roleArn: pipelineRoleArn,
            artifactStore: {
                location: artifactBucket,
                type: 'S3',
                encryptionKey: {
                    type: 'KMS',
                    name: kmsKeyName
                }
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
                                "S3Bucket" : destBucket,
                                "Extract": "false"
                            }
                        }
                    ]
                }
            ]
        }
    }
}

function promiseCreatePipeline(dappName, destBucket) {
    return codepipeline.createPipeline(
        pipelineParams(dappName, destBucket)
    ).promise();
}

function promiseRunPipeline(pipelineId) {
    return codepipeline.startPipelineExecution({
        name: pipelineId
    }).promise()
}

function promiseDeletePipeline(pipelineId) {
    return codepipeline.deletePipeline({
        name: pipelineId
    }).promise()
}

module.exports = {
    create: promiseCreatePipeline,
    run: promiseRunPipeline,
    delete: promiseDeletePipeline,
    name: pipelineName
}