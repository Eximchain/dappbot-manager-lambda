const shell = require('shelljs');
const zip = require('node-zip');
const { updateRootObject } = require('./cloudfront');
const { getObject, configureBucketWebsite } = require('./s3'); 
const { sendConfirmation } = require('./sendgrid');

// View a sample JSON event from a CodePipeline here:
//
// https://docs.aws.amazon.com/codepipeline/latest/userguide/actions-invoke-lambda-function.html#actions-invoke-lambda-function-json-event-example
//
// Below function is called by index, it receives the event["CodePipeline.job"]["data"] field.
async function postPipelineCleanup({ actionConfiguration, inputArtifacts }){
  // Get distroId & owner from UserParameters
  const { OwnerEmail, DistributionId } = JSON.parse(actionConfiguration.UserParameters) 

  // Fetch the dappseed artifact, make sure we're in /tmp, unzip it to the filesystem
  const { bucketName, objectKey } = inputArtifacts[0].location.s3Location;
  let dappName, indexName;
  shell.cd('/tmp');
  try {
    const dappseedBuffer = await getObject(bucketName, objectKey);
    const dappseedZip = new zip(dappseedBuffer, { base64: false })
    const dappseedConfig = JSON.parse(dappseedZip.files['config.json']);
    dappName = dappseedConfig.contract_name;
    indexName = dappseedConfig.indexName;
  } catch (err) {
    console.log("Error fetching & parsing the dappseed!: ",err);
    throw err;
  }

  console.log("Successfully loaded all info to the clean function:");
  console.log(`OwnerEmail: ${OwnerEmail}`);
  console.log(`DistributionID: ${DistributionId}`);
  console.log(`DappName: `,dappName);
  console.log(`IndexName: `,indexName);
  
  try {
    await configureBucketWebsite(bucketName, indexName);
  } catch (err) {
    console.log("Error updating S3 bucket website config!: ",err);
    throw err;
  }

  // Call the Cloudfront update fxn
  try {
    await updateRootObject(DistributionId, indexName);
  } catch (err) {
    console.log("Error updating the Cloudfront distro's root object!: ",err);
    throw err;
  }

  // Send out the "Dapp complete!" Sendgrid email
  try {
    sendConfirmation(OwnerEmail, dappName);
  } catch (err) {
    console.log("Error sending the confirmation email via Sendgrid!: ",err);
    throw err;
  }

  return `Successfully updated Distribution-${DistributionId}'s root object to ${indexName} and sent the creation confirmation email to ${OwnerEmail}.`;
}

module.exports = {
  postPipelineCleanup : postPipelineCleanup
}