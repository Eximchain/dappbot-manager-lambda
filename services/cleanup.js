const { dnsRoot } = require('../env');
const { setDappAvailable, setDappFailed } = require('./dynamoDB');
const { makeObjectNoCache } = require('./s3'); 
const { completeJob, failJob } = require('./codepipeline');
const { sendConfirmation } = require('./sendgrid');

// View a sample JSON event from a CodePipeline here:
//
// https://docs.aws.amazon.com/codepipeline/latest/userguide/actions-invoke-lambda-function.html#actions-invoke-lambda-function-json-event-example
//
// Below function is called by index, it receives the event["CodePipeline.job"] field.
async function postPipelineCleanup({ data, id }){
  const { actionConfiguration } = data;
  // TODO: Get Dapp DNS from here
  const { OwnerEmail, DestinationBucket, DappName } = JSON.parse(actionConfiguration.configuration.UserParameters) 

  console.log("Successfully loaded all info to the clean function:");
  console.log(`OwnerEmail: ${OwnerEmail}; DappName: ${DappName}; DestinationBucket: ${DestinationBucket}`);

  try {
    await makeObjectNoCache(DestinationBucket, 'index.html');
    await setDappAvailable(DappName);
    await sendConfirmation(OwnerEmail, DappName, dnsNameFromDappName(DappName));
    console.log("Successfully completed all CodePipeline cleanup steps!");
    return await completeJob(id);
  } catch (err) {
    console.log("Error cleaning up the CodePipeline execution: ", err);
    await failJob(id, err);
    return await setDappFailed(DappName);
  }
}

function dnsNameFromDappName(dappName) {
  return dappName.concat(dnsRoot);
}

module.exports = {
  postPipelineCleanup : postPipelineCleanup
}