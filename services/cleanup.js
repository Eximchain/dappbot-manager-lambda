const zip = require('node-zip');
const { getObject, makeObjectNoCache } = require('./s3'); 
const { sendConfirmation } = require('./sendgrid');

// View a sample JSON event from a CodePipeline here:
//
// https://docs.aws.amazon.com/codepipeline/latest/userguide/actions-invoke-lambda-function.html#actions-invoke-lambda-function-json-event-example
//
// Below function is called by index, it receives the event["CodePipeline.job"]["data"] field.
async function postPipelineCleanup({ actionConfiguration, inputArtifacts }){
  // Get distroId & owner from UserParameters
  const { OwnerEmail, DappseedBucket } = JSON.parse(actionConfiguration.UserParameters) 

  // Fetch the dappseed artifact, make sure we're in /tmp, unzip it to the filesystem
  const { bucketName, objectKey } = inputArtifacts[0].location.s3Location;
  let dappName;
  try {
    const dappseedBuffer = await getObject(bucketName, objectKey);
    const dappseedZip = new zip(dappseedBuffer, { base64: false })
    const dappseedConfig = JSON.parse(dappseedZip.files['config.json']);
    dappName = dappseedConfig.contract_name;
  } catch (err) {
    console.log("Error fetching & parsing the dappseed!: ",err);
    throw err;
  }

  console.log("Successfully loaded all info to the clean function:");
  console.log(`OwnerEmail: ${OwnerEmail}`);
  console.log(`DappName: `,dappName);

  // Set the index.html file's Cache-Control to max-age=0
  try {
    await makeObjectNoCache(DappseedBucket, 'index.html');
  } catch (err) {
    console.log("Error updating S3 bucket website config!: ",err);
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