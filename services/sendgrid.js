const sgMail = require('@sendgrid/mail');
const { sendgridApiKey } = require('../env');
const { dappDNS } = require('./route53');

sgMail.setApiKey(sendgridApiKey);

const FROM_ADDRESS = 'dappbot@eximchain.com';


function sendConfirmationMail(owner, dappname) {
  let confirmationParam = {
    from : FROM_ADDRESS,
    to : owner,
    subject : `${dappname} generation complete!`,
    text : `${dappname} generation has completed!  You may now view your dapp at ${dappDNS(dappname)}.`
  }
  sgMail.send(confirmationParam);
}

module.exports = {
  sendConfirmation : sendConfirmationMail
}