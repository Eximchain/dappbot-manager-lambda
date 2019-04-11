const uuidv4 = require('uuid/v4');
const { AWS, awsRegion, dappseedBucket } = require('../env');
const zip = require('jszip');
const shell = require('shelljs');
const fs = require('fs');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const s3BucketPrefix = "exim-abi-clerk-";
const sampleHtml = `<html>
<header><title>This is title</title></header>
<body>
Hello world
</body>
</html>`;

function promiseCreateS3Bucket(bucketName) {
    let params = {
        Bucket: bucketName,
        ACL: 'public-read'
    };
    return s3.createBucket(params).promise();
}

function promiseDeleteS3Bucket(bucketName) {
    let params = {
        Bucket: bucketName
    };
    return s3.deleteBucket(params).promise();
}

function promiseListS3Objects(bucketName) {
    let params = {
        Bucket: bucketName
    };
    return s3.listObjects(params).promise();
}

function promiseEmptyS3Bucket(bucketName) {
    console.log("Emptying S3 bucket ", bucketName)
    // TODO: Does this have issues with the limit of list objects?
    return promiseListS3Objects(bucketName).then(function(result) {
        console.log("List S3 Objects Success", result);
        let deletePromises = result.Contents.map((obj)=>{
            return s3.deleteObject({
                Bucket: bucketName,
                Key: obj.Key
            }).promise()
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

function promiseConfigureS3BucketStaticWebsite(bucketName) {
    let params = {
        Bucket: bucketName,
        WebsiteConfiguration: {
            ErrorDocument: {
                Key: 'error.html'
            },
            IndexDocument: {
                Suffix: 'index.html'
            }
        }
    };
    return s3.putBucketWebsite(params).promise();
}

function promiseGetS3BucketWebsiteConfig(bucketName) {
    let params = {
        Bucket: bucketName
    };
    return s3.getBucketWebsite(params).promise();
}

function promisePutDappseed({ dappName, web3URL, guardianURL, abi, addr }){
    shell.cd('/tmp');
    const dappseed = new zip();
    dappseed.file('./Contract.json', abi);
    dappseed.file('./config.json', JSON.stringify({
        contract_name : dappName,
        contract_addr : addr,
        contract_path : './Contract.json',
        web3URL, guardianURL
    }, undefined, 2))
    return dappseed.generateAsync({type : 'blob'}).then((dappseedFile)=>{
        return s3.putObject({
            Bucket : dappseedBucket,
            ACL: 'private',
            Key: `${dappName}/dappseed.zip`,
            Body: dappseedFile
        }).promise()
    })
}

function promisePutS3Objects(bucketName) {
    let params = {
        Bucket: bucketName,
        ACL: 'public-read',
        ContentType: 'text/html',
        Key: 'index.html',
        Body: sampleHtml
    };
    return s3.putObject(params).promise();
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
    putBucketWebsite : promisePutS3Objects,
    putDappseed : promisePutDappseed,
    createBucket : promiseCreateS3Bucket,
    deleteBucket : promiseDeleteS3Bucket,
    emptyBucket : promiseEmptyS3Bucket,
    listObjects : promiseListS3Objects,
    newBucketName : createBucketName,
    bucketEndpoint : getS3BucketEndpoint
}