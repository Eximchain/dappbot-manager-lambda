const sgMail = require('@sendgrid/mail');
const { sendgridApiKey } = require('../env');
const { dappDNS } = require('./route53');

let USING_SENDGRID = false;

if (sendgridApiKey){
  sgMail.setApiKey(sendgridApiKey);
  USING_SENDGRID = true;
}

const FROM_ADDRESS = 'dappbot@eximchain.com';


function sendConfirmationMail(owner, dappname) {
  let confirmationParam = {
    from : FROM_ADDRESS,
    to : owner,
    subject : `${dappname} generation complete!`,
    text : `${dappname} generation has completed!  You may now view your dapp at ${dappDNS(dappname)}.`
  }
  if (USING_SENDGRID){
    return sgMail.send(confirmationParam);
  } else {
    let msg = `No Sendgrid API key loaded, not sending following email: ${JSON.stringify(confirmationParam, undefined, 2)}`;
    console.log(msg);
    return Promise.resolve(msg);
  }
  
}

module.exports = {
  sendConfirmation : sendConfirmationMail
}