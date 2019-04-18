const uuidv4 = require('uuid/v4');
const { defaultTags, dappNameTag } = require('../common');
const { AWS, certArn } = require('../env');
const { dappDNS } = require('./route53');
const cloudfront = new AWS.CloudFront({apiVersion: '2018-11-05'});

function promiseCreateCloudfrontDistribution(appName, s3Origin) {
    // TODO: Origin Access Identity
    // TODO: Verify that we want these args
    // TODO: Set up SSL
    
    let extraTags = [dappNameTag(appName)];

    let params = {
        DistributionConfig: {
            CallerReference: uuidv4(),
            Aliases: {
                Quantity: 1,
                Items: [dappDNS(appName)]
            },
            DefaultRootObject: 'index.html',
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
            ViewerCertificate : {
                ACMCertificateArn : certArn,
                SSLSupportMethod : 'sni-only',
            },
            DefaultCacheBehavior: {
                TargetOriginId: 's3-origin',
                ForwardedValues: {
                    QueryString: false,
                    Cookies: {
                        Forward: 'none'
                    },
                    ViewerProtocolPolicy: 'allow-all',
                    MinTTL: 0,
                    AllowedMethods: {
                        Quantity: 7,
                        Items: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'PATCH', 'POST', 'DELETE']
                    }
                },
                Enabled: true,
                Comment: "Cloudfront distribution for ".concat(appName),
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
            Tags: {
                Items: defaultTags.concat(extraTags)
            }
        }
    };
    return cloudfront.createDistributionWithTags(params).promise();
}

function promiseGetCloudfrontDistributionConfig(distroId) {
    let params = {
        Id: distroId
    }
    return cloudfront.getDistributionConfig(params).promise();
}

function promiseDisableCloudfrontDistribution(distroId) {
    return promiseGetCloudfrontDistributionConfig(distroId).then(function(result) {
        console.log("Get Cloudfront Distro Config Success", result);
        let config = result.DistributionConfig;
        config.Enabled = false;

        let params = {
            Id: distroId,
            IfMatch: result.ETag,
            DistributionConfig: config
        };
        return cloudfront.updateDistribution(params).promise();
    })
    .catch(function(err) {
        console.log("Error", err);
        return Promise.reject(err);
    });
}

function promiseDeleteCloudfrontDistribution(distroId){
    return cloudfront.deleteDistribution({
        Id: distroId
    }).promise();
}

module.exports = {
    createDistro : promiseCreateCloudfrontDistribution,
    getDistroConfig : promiseGetCloudfrontDistributionConfig,
    disableDistro : promiseDisableCloudfrontDistribution,
    deleteDistro : promiseDeleteCloudfrontDistribution
};