const assert = require('assert');
const uuidv4 = require('uuid/v4');
const { defaultTags, dappNameTag, dappOwnerTag, addAwsPromiseRetries } = require('../common');
const { AWS, certArn } = require('../env');
const { dappDNS } = require('./route53');
const cloudfront = new AWS.CloudFront({apiVersion: '2018-11-05'});

function promiseCreateCloudfrontDistribution(appName, dappOwner, s3Origin) {
    // TODO: Origin Access Identity
    // TODO: Verify that we want these args
    
    let maxRetries = 5;
    let extraTags = [dappNameTag(appName), dappOwnerTag(dappOwner)];

    let params = {
        DistributionConfigWithTags: {
            DistributionConfig: {
                CallerReference: uuidv4(),
                DefaultRootObject: 'index.html',
                Aliases: {
                    Quantity: 1,
                    Items: [dappDNS(appName)]
                },
                ViewerCertificate : {
                    ACMCertificateArn : certArn,
                    SSLSupportMethod : 'sni-only',
                },
                Origins: {
                    Quantity: 1,
                    Items: [{
                        Id: 's3-origin',
                        DomainName: s3Origin,
                        S3OriginConfig: {
                            OriginAccessIdentity: ''
                        }
                    }],
                },
                DefaultCacheBehavior: {
                    TargetOriginId: 's3-origin',
                    ForwardedValues: {
                        QueryString: false,
                        Cookies: {
                            Forward: 'none'
                        },
                        Headers: {
                            Quantity: 0
                        }
                    },
                    TrustedSigners: {
                        Quantity: 0,
                        Enabled: false
                    },
                    ViewerProtocolPolicy: 'redirect-to-https',
                    MinTTL: 0,
                    AllowedMethods: {
                        Quantity: 7,
                        Items: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'PATCH', 'POST', 'DELETE']
                    }
                },
                Enabled: true,
                Comment: "Cloudfront distribution for ".concat(appName)
            },
            Tags: {
                Items: defaultTags.concat(extraTags)
            }
        }
    };
    return addAwsPromiseRetries(() => cloudfront.createDistributionWithTags(params).promise(), maxRetries);
}

function promiseGetCloudfrontDistributionConfig(distroId) {
    let maxRetries = 5;
    let params = {
        Id: distroId
    }
    return addAwsPromiseRetries(() => cloudfront.getDistributionConfig(params).promise(), maxRetries);
}

function promiseDisableCloudfrontDistribution(distroId) {
    let maxUpdateRetries = 5;
    return promiseGetCloudfrontDistributionConfig(distroId).then(function(result) {
        console.log("Get Cloudfront Distro Config Success", result);
        let config = result.DistributionConfig;
        config.Enabled = false;

        let params = {
            Id: distroId,
            IfMatch: result.ETag,
            DistributionConfig: config
        };
        return addAwsPromiseRetries(() => cloudfront.updateDistribution(params).promise(), maxUpdateRetries);
    })
    .catch(function(err) {
        console.log("Error", err);
        return Promise.reject(err);
    });
}

function promiseUpdateCloudfrontDistributionOriginAndEnable(distroId, s3Origin) {
    let maxUpdateRetries = 5;
    return promiseGetCloudfrontDistributionConfig(distroId).then(function(result) {
        console.log("Get Cloudfront Distro Config Success", result);
        let config = result.DistributionConfig;
        console.log("Origin", config.Origins.Items[0]);
        let originItem = {
            Id: 's3-origin',
            DomainName: s3Origin,
            OriginPath: '',
            S3OriginConfig: {
                OriginAccessIdentity: ''
            },
            CustomHeaders: {
                Quantity: 0
            }
        };
        config.Origins.Items[0] = originItem;
        config.Enabled = true;

        let params = {
            Id: distroId,
            IfMatch: result.ETag,
            DistributionConfig: config
        };
        return addAwsPromiseRetries(() => cloudfront.updateDistribution(params).promise(), maxUpdateRetries);
    })
    .catch(function(err) {
        console.log("Error", err);
        return Promise.reject(err);
    });
}

function promiseDeleteCloudfrontDistribution(distroId) {
    let maxRetries = 5;
    let params = {
        Id: distroId
    };
    return addAwsPromiseRetries(() => cloudfront.deleteDistribution(params).promise(), maxRetries);
}

function promiseListCloudfrontDistributions(marker) {
    let maxRetries = 5;
    let params = marker ? { Marker: marker } : {};
    return addAwsPromiseRetries(() => cloudfront.listDistributions(params).promise(), maxRetries);
}

function promiseListTagsForCloudfrontDistribution(distroArn) {
    let maxRetries = 5;
    let params = {
        Resource: distroArn
    };
    return addAwsPromiseRetries(() => cloudfront.listTagsForResource(params).promise(), maxRetries);
}

function promiseCreateCloudfrontInvalidation(distroId, pathPrefix='/') {
    let maxRetries = 5;
    let params = {
        DistributionId: distroId,
        InvalidationBatch: {
            CallerReference: uuidv4(),
            Paths: {
                Quantity: 1,
                Items: [
                    `${pathPrefix}*`
                ]
            }
        }
    };
    return addAwsPromiseRetries(() => cloudfront.createInvalidation(params).promise(), maxRetries);
}

async function getConflictingDistribution(dappName) {
    let conflictingAlias = dappDNS(dappName);
    let marker = null;
    while (true) {
        let existingDistroPage = await promiseListCloudfrontDistributions(marker);
        let existingDistrosMatchingAlias = existingDistroPage.Items.filter(item => item.Aliases.Quantity === 1)
                                                                   .filter(item => item.Aliases.Items[0] === conflictingAlias);
        assert(existingDistrosMatchingAlias.length <= 1, `Found ${existingDistrosMatchingAlias.length} distribution with matching CNAME instead of at most 1. This must be a bug!`);

        if (existingDistrosMatchingAlias.length == 1) {
            return existingDistrosMatchingAlias[0];
        }

        if (existingDistroPage.IsTruncated) {
            marker = existingDistroPage.Marker;
        } else {
            return null;
        }
    }
}

async function getDistributionOwner(distroArn) {
    let listTagsResponse = await promiseListTagsForCloudfrontDistribution(distroArn);
    let distroTags = listTagsResponse.Tags.Items;
    let dappOwnerTagList = distroTags.filter(tag => tag.Key === 'DappOwner');
    assert(dappOwnerTagList.length == 1, `Found ${dappOwnerTagList.length} tags with Key 'DappOwner' instead of exactly 1. This must be a bug!`);
    return dappOwnerTagList[0].Value;
}

async function promiseUpdateCloudfrontDistrubtionRootObject(distroId, objectName) {
    let maxRetries = 5;
    const currentConfig = await cloudfront.getDistributionConfig(distroId).promise();
    let newConfigParams = {
        Id : distroId,
        IfMatch : currentConfig.ETag,
        DistributionConfig : currentConfig.DistributionConfig
    }
    newConfigParams.DistributionConfig.DefaultRootObject = objectName;
    return addAwsPromiseRetries(() => cloudfront.updateDistribution(newConfigParams).promise(), maxRetries);
}

module.exports = {
    createDistro : promiseCreateCloudfrontDistribution,
    getDistroConfig : promiseGetCloudfrontDistributionConfig,
    disableDistro : promiseDisableCloudfrontDistribution,
    deleteDistro : promiseDeleteCloudfrontDistribution,
    listTags : promiseListTagsForCloudfrontDistribution,
    updateOriginAndEnable : promiseUpdateCloudfrontDistributionOriginAndEnable,
    getConflictingDistro : getConflictingDistribution,
    getDistroOwner : getDistributionOwner,
    invalidateDistroPrefix : promiseCreateCloudfrontInvalidation,
    updateRootObject : promiseUpdateCloudfrontDistrubtionRootObject
};