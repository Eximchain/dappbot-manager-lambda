const zip = require('node-zip');
const { getObject, makeObjectNoCache } = require('./s3'); 
const { completeJob, failJob } = require('./codepipeline');
const { sendConfirmation } = require('./sendgrid');

// View a sample JSON event from a CodePipeline here:
//
// https://docs.aws.amazon.com/codepipeline/latest/userguide/actions-invoke-lambda-function.html#actions-invoke-lambda-function-json-event-example
//
// Below function is called by index, it receives the event["CodePipeline.job"]["data"] field.
async function postPipelineCleanup({ data, id }){
  // Get distroId & owner from UserParameters
  const { actionConfiguration } = data;
  const { OwnerEmail, DappseedBucket, DappName } = JSON.parse(actionConfiguration.configuration.UserParameters) 
  console.log("parsed and unpacked UserParameters")

  console.log("Successfully loaded all info to the clean function:");
  console.log(`OwnerEmail: ${OwnerEmail}`);
  console.log(`DappName: `,DappName);
  console.log('DappseedBucket: ',DappseedBucket);

  // Set the index.html file's Cache-Control to max-age=0
  try {
    await makeObjectNoCache(DappseedBucket, 'index.html');
  } catch (err) {
    console.log("Error updating S3 bucket website config!: ",err);
    return await failJob(id);
  }

  // Send out the "Dapp complete!" Sendgrid email
  try {
    await sendConfirmation(OwnerEmail, DappName);
  } catch (err) {
    console.log("Error sending the confirmation email via Sendgrid!: ",err);
    return await failJob(id);
  }

  try {
    console.log("Successfully completed CodePipeline cleanup!")
    return await completeJob(id);
  } catch (err) {
    console.log("Error marking the job as complete!: ",err);
    return await failJob(id);
  }
}

module.exports = {
  postPipelineCleanup : postPipelineCleanup
}