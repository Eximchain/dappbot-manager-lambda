import { addAwsPromiseRetries } from '../common';
import { AWS, codebuildId, pipelineRoleArn, artifactBucket, dappseedBucket, servicesLambdaFxnName } from '../env';
import { CreatePipelineInput } from 'aws-sdk/clients/codepipeline';

const codepipeline = new AWS.CodePipeline();

enum PipelineJobs {
    POC_CLEANUP = 'POC_CLEANUP',
    ENTERPRISE_GITHUB_COMMIT = 'ENTERPRISE_GITHUB_COMMIT'
}

function pocPipelineParams(dappName:string, pipelineName:string, destBucket:string, owner:string) {
    let pipelineParam:CreatePipelineInput = {
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
                                "FunctionName": servicesLambdaFxnName,
                                "UserParameters": JSON.stringify({
                                    Job: PipelineJobs.POC_CLEANUP,
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
    };
    return pipelineParam;
}

function enterprisePipelineParams(dappName:string, pipelineName:string, owner:string) {
    let pipelineParam:CreatePipelineInput = {
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
                    "name": "CommitToGithub",
                    "actions": [
                        {
                            "inputArtifacts": [
                                {
                                    "name": "BUILD"
                                }
                            ],
                            "name": "Commit",
                            "actionTypeId": {
                                "category": "Invoke",
                                "owner": "AWS",
                                "version": "1",
                                "provider": "Lambda"
                            },
                            "runOrder":1,
                            "configuration": {
                                "FunctionName": servicesLambdaFxnName,
                                "UserParameters": JSON.stringify({
                                    Job: PipelineJobs.ENTERPRISE_GITHUB_COMMIT,
                                    OwnerEmail: owner,
                                    DappName : dappName
                                })
                            }
                        }
                    ]
                }
            ]
        }
    };
    return pipelineParam;
}

function promiseCreatePipeline(params:any) {
    let maxRetries = 5;
    return addAwsPromiseRetries(() => codepipeline.createPipeline(params).promise(), maxRetries);
}

function promiseCreatePocPipeline(dappName:string, pipelineName:string, destBucket:string, owner:string) {
    return promiseCreatePipeline(pocPipelineParams(dappName, pipelineName, destBucket, owner));
}

function promiseCreateEnterprisePipeline(dappName:string, pipelineName:string, owner:string) {
    return promiseCreatePipeline(enterprisePipelineParams(dappName, pipelineName, owner));
}

function promiseRunPipeline(pipelineName:string) {
    let maxRetries = 5;
    let params = {
        name: pipelineName
    };
    return addAwsPromiseRetries(() => codepipeline.startPipelineExecution(params).promise(), maxRetries);
}

function promiseDeletePipeline(pipelineName:string) {
    let maxRetries = 5;
    let params = {
        name: pipelineName
    };
    return addAwsPromiseRetries(() => codepipeline.deletePipeline(params).promise(), maxRetries);
}

function promiseCompleteJob(jobId:string) {
    let maxRetries = 5;
    let params = {
        jobId : jobId
    }
    return addAwsPromiseRetries(() => codepipeline.putJobSuccessResult(params).promise(), maxRetries);
}

function promiseFailJob(jobId:string, err:any) {
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

export default {
    createPocPipeline: promiseCreatePocPipeline,
    createEnterprisePipeline: promiseCreateEnterprisePipeline,
    run: promiseRunPipeline,
    delete: promiseDeletePipeline,
    completeJob: promiseCompleteJob,
    failJob : promiseFailJob
}