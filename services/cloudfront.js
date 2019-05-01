const uuidv4 = require('uuid/v4');
const { defaultTags, dappNameTag, addAwsPromiseRetries } = require('../common');
const { AWS, certArn } = require('../env');
const { dappDNS } = require('./route53');
const cloudfront = new AWS.CloudFront({apiVersion: '2018-11-05'});

function promiseCreateCloudfrontDistribution(appName, s3Origin) {
    // TODO: Origin Access Identity
    // TODO: Verify that we want these args
    // TODO: Set up SSL
    
    let maxRetries = 5;
    let extraTags = [dappNameTag(appName)];

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

function promiseDeleteCloudfrontDistribution(distroId) {
    let maxRetries = 5;
    let params = {
        Id: distroId
    };
    return addAwsPromiseRetries(() => cloudfront.deleteDistribution(params).promise(), maxRetries);
}

module.exports = {
    createDistro : promiseCreateCloudfrontDistribution,
    getDistroConfig : promiseGetCloudfrontDistributionConfig,
    disableDistro : promiseDisableCloudfrontDistribution,
    deleteDistro : promiseDeleteCloudfrontDistribution
};