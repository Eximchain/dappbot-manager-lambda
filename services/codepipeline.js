const { AWS, codebuildId, pipelineRoleArn, dnsRoot, artifactBucket, dappseedBucket } = require('../env');

const codepipeline = new AWS.CodePipeline();

function pipelineName(dappName) {
  return `${dappName}-pipeline-${dnsRoot}`
}

function pipelineParams(dappName, destBucket) {
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

function promiseRunPipeline(dappName) {
    return codepipeline.startPipelineExecution({
        name: pipelineName(dappName)
    }).promise()
}

function promiseDeletePipeline(dappName) {
    return codepipeline.deletePipeline({
        name: pipelineName(dappName)
    }).promise()
}

module.exports = {
    create: promiseCreatePipeline,
    run: promiseRunPipeline,
    delete: promiseDeletePipeline,
    name: pipelineName
}