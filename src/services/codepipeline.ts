import { addAwsPromiseRetries } from '../common';
import { AWS, codebuildId, codebuildGenerateId, codebuildBuildId, pipelineRoleArn, artifactBucket, dappseedBucket, servicesLambdaFxnName, githubToken } from '../env';
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

function enterpriseSrcPipelineParams(dappName:string, pipelineName:string, owner:string, targetRepoName:string, targetRepoOwner:string) {
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
                                "ProjectName": codebuildGenerateId
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
                                    DappName : dappName,
                                    TargetRepoName: targetRepoName,
                                    TargetRepoOwner: targetRepoOwner
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

function enterpriseBuildPipelineParams(dappName:string, owner:string, pipelineName:string, targetRepoName:string, targetRepoOwner:string, destBucket:string) {
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
                    "name": "FetchSource",
                    "actions": [
                        {
                            "name": "Source",
                            "actionTypeId": {
                                "category": "Source",
                                "owner": "ThirdParty",
                                "version": "1",
                                "provider": "GitHub"
                            },
                            "outputArtifacts": [
                                {
                                    "name": "SOURCE"
                                }
                            ],
                            "configuration": {
                                "Owner": targetRepoOwner,
                                "Repo": targetRepoName,
                                "Branch": "master",
                                "OAuthToken": githubToken
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
                                    "name": "SOURCE"
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
                                "ProjectName": codebuildBuildId
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

function promiseCreatePipeline(params:any) {
    let maxRetries = 5;
    return addAwsPromiseRetries(() => codepipeline.createPipeline(params).promise(), maxRetries);
}

function promiseCreatePocPipeline(dappName:string, pipelineName:string, destBucket:string, owner:string) {
    return promiseCreatePipeline(pocPipelineParams(dappName, pipelineName, destBucket, owner));
}

function promiseCreateEnterpriseSrcPipeline(dappName:string, pipelineName:string, owner:string, targetRepoName:string, targetRepoOwner:string) {
    return promiseCreatePipeline(enterpriseSrcPipelineParams(dappName, pipelineName, owner, targetRepoName, targetRepoOwner));
}
function promiseCreateEnterpriseBuildPipeline(dappName:string, owner:string, pipelineName:string, targetRepoName:string, targetRepoOwner:string, destBucket:string) {
    return promiseCreatePipeline(enterpriseBuildPipelineParams(dappName, owner, pipelineName, targetRepoName, targetRepoOwner, destBucket));
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
    createEnterpriseSrcPipeline: promiseCreateEnterpriseSrcPipeline,
    createEnterpriseBuildPipeline: promiseCreateEnterpriseBuildPipeline,
    run: promiseRunPipeline,
    delete: promiseDeletePipeline,
    completeJob: promiseCompleteJob,
    failJob : promiseFailJob
}