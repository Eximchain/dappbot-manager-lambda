const uuidv4 = require('uuid/v4');
const { AWS, awsRegion, dappseedBucket } = require('../env');
const { defaultTags, dappNameTag, addAwsPromiseRetries } = require('../common');
const shell = require('shelljs');
const fs = require('fs');
const zip = require('node-zip');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const s3BucketPrefix = "exim-abi-clerk-";
const sampleHtml = `<html>
<header><title>This is title</title></header>
<body>
Hello world
</body>
</html>`;

function promiseCreateS3Bucket(bucketName) {
    let maxRetries = 5;
    let params = {
        Bucket: bucketName,
        ACL: 'public-read'
    };
    return addAwsPromiseRetries(() => s3.createBucket(params).promise(), maxRetries);
}

function promiseDeleteS3Bucket(bucketName) {
    let maxRetries = 5;
    let params = {
        Bucket: bucketName
    };
    return addAwsPromiseRetries(() => s3.deleteBucket(params).promise(), maxRetries);
}

function promiseListS3Objects(bucketName) {
    let maxRetries = 5;
    let params = {
        Bucket: bucketName
    };
    return addAwsPromiseRetries(() => s3.listObjects(params).promise(), maxRetries);
}

function promiseEmptyS3Bucket(bucketName) {
    let maxDeleteRetries = 5;
    console.log("Emptying S3 bucket ", bucketName)
    // TODO: Does this have issues with the limit of list objects?
    return promiseListS3Objects(bucketName).then(function(result) {
        console.log("List S3 Objects Success", result);
        let deletePromises = result.Contents.map((obj)=>{
            let params = {
                Bucket: bucketName,
                Key: obj.Key
            };
            return addAwsPromiseRetries(() => s3.deleteObject(params).promise(), maxDeleteRetries)
        })
        let retPromise = Promise.all(deletePromises);
        console.log("Returning promise", retPromise, "With deletePromises", deletePromises)
        return retPromise;
    })
    .catch(function(err) {
        console.log("Error", err);
        return Promise.reject(err);
    });
}

function promiseSetS3BucketPublicReadable(bucketName){
    let maxRetries = 5;
    let params = {
        Bucket: bucketName,
        Policy : JSON.stringify({
            "Version":"2012-10-17",
            "Statement":[{
            "Sid":"PublicReadGetObject",
                  "Effect":"Allow",
              "Principal": "*",
                "Action":["s3:GetObject"],
                "Resource":[`arn:aws:s3:::${bucketName}/*`]
              }
            ]
        })
    };
    return addAwsPromiseRetries(() => s3.putBucketPolicy(params).promise(), maxRetries);
}


function promiseConfigureS3BucketStaticWebsite(bucketName) {
    let maxRetries = 5;
    let params = {
        Bucket: bucketName,
        WebsiteConfiguration: {
            ErrorDocument: {
                Key: 'index.html'
            },
            IndexDocument: {
                Suffix: 'index.html'
            }
        }
    };
    return addAwsPromiseRetries(() => s3.putBucketWebsite(params).promise(), maxRetries);
}

function promiseGetS3BucketWebsiteConfig(bucketName) {
    let maxRetries = 5;
    let params = {
        Bucket: bucketName
    };
    return addAwsPromiseRetries(() => s3.getBucketWebsite(params).promise(), maxRetries);
}

function promisePutDappseed({ dappName, web3URL, guardianURL, abi, addr }) {
    shell.cd('/tmp');
    const dappZip = new zip();
    const abiObj = typeof abi === 'string' ? JSON.parse(abi) : abi;
    dappZip.file('Contract.json', JSON.stringify(abiObj, undefined, 2));
    dappZip.file('config.json', JSON.stringify({
        contract_name : dappName,
        contract_addr : addr,
        contract_path : './Contract.json',
        web3URL, guardianURL
    }, undefined, 2));
    fs.writeFileSync('./dappseed.zip', dappZip.generate({base64:false,compression:'DEFLATE'}), 'binary')
    const zipData = fs.readFileSync('./dappseed.zip');

    let maxRetries = 5;
    let params = {
        Bucket : dappseedBucket,
        ACL: 'private',
        Key: `${dappName}/dappseed.zip`,
        Body: zipData
    };
    return addAwsPromiseRetries(() => s3.putObject(params).promise(), maxRetries);
}

function promisePutS3Objects(bucketName) {
    let maxRetries = 5;
    let params = {
        Bucket: bucketName,
        ACL: 'public-read',
        ContentType: 'text/html',
        Key: 'index.html',
        Body: sampleHtml
    };
    return addAwsPromiseRetries(() => s3.putObject(params).promise(), maxRetries);
}

function promisePutBucketTags(bucketName, tags) {
    let maxRetries = 5;
    let params = {
        Bucket: bucketName,
        Tagging: {
            TagSet: tags
        }
    };
    return addAwsPromiseRetries(() => s3.putBucketTagging(params).promise(), maxRetries);
}

function promiseCreateS3BucketWithTags(bucketName, dappName) {
    console.log("Creating S3 bucket ", bucketName)
    return promiseCreateS3Bucket(bucketName).then(function(result) {
        console.log("Create S3 Bucket Success", result);
        let extraTags = [dappNameTag(dappName)];
        let bucketTags = defaultTags.concat(extraTags);
        console.log("Applying Default Bucket Tags", defaultTags)
        return promisePutBucketTags(bucketName, bucketTags);
    })
    .catch(function(err) {
        console.log("Error", err);
        return Promise.reject(err);
    });
}

function createBucketName() {
    return s3BucketPrefix.concat(uuidv4());
}

function getS3BucketEndpoint(bucketName) {
    return bucketName.concat(".s3.").concat(awsRegion).concat(".amazonaws.com");
}

module.exports = {
    getBucketWebsite : promiseGetS3BucketWebsiteConfig,
    configureBucketWebsite : promiseConfigureS3BucketStaticWebsite,
    setBucketPublic : promiseSetS3BucketPublicReadable,
    putBucketWebsite : promisePutS3Objects,
    putDappseed : promisePutDappseed,
    createBucketWithTags : promiseCreateS3BucketWithTags,
    deleteBucket : promiseDeleteS3Bucket,
    emptyBucket : promiseEmptyS3Bucket,
    listObjects : promiseListS3Objects,
    newBucketName : createBucketName,
    bucketEndpoint : getS3BucketEndpoint
}