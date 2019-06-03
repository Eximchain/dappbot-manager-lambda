export const createDappEmail = (dappname: string, dappDNS: string) => {
  return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>The DappBot Team</title>
  </head>
  <body style="-webkit-text-size-adjust: none; box-sizing: border-box; color: #626b76; font-family: 'Helvetica Neue', Helvetica, sans-serif; height: 100%; line-height: 1.4; margin: 0; width: 100% !important;" bgcolor="#f7f8f9"><style type="text/css">
body {
width: 100% !important; height: 100%; margin: 0; line-height: 1.4; background-color: #fff; color: #626b76; -webkit-text-size-adjust: none;
}
@media only screen and (max-width: 600px) {
  .email-body_inner {
    width: 100% !important;
  }
  .email-footer {
    width: 100% !important;
  }
}
@media only screen and (max-width: 500px) {
  .button {
    width: 100% !important;
  }
}
</style>
    <span class="preheader" style="box-sizing: border-box; display: none !important; font-family: 'Helvetica Neue', Helvetica, sans-serif; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; mso-hide: all; opacity: 0; overflow: hidden; visibility: hidden;">DappBot - Dapp Created</span>
    <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif; margin: 0; padding: 0; width: 100%;" bgcolor="#f7f8f9">
      <tr>
        <td align="center" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif; word-break: break-word;">
          <table class="email-content" width="100%" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif; margin: 0; padding: 0; width: 100%;">
            <tr style="background: #fff;">
              <td height="40" class="em_height">&nbsp;</td>
            </tr>
            <tr style="background: #fff;">
              <td align="center">
                <a href="#" target="_blank" style="text-decoration:none;"><img src="https://eximchain.com/dappbot.png" width="100" height="auto" style="display:block; margin-bottom: 25px;" border="0" alt="DappBot"/></a>
                  <h2 style="font-size: 1.2em; font-weight: Bold; margin-top: -10px; margin-bottom: 0.809em; color: #007ef5;">DappBot</h2>
              </td>
            </tr>
            <tr style="background: #fff;">
              <td height="30" class="em_height">&nbsp;</td>
            </tr>

            <tr>
              <td class="email-body" width="100%" cellpadding="0" cellspacing="0" style="-premailer-cellpadding: 0; -premailer-cellspacing: 0; border-bottom-color: #EDEFF2; border-bottom-style: solid; border-bottom-width: 1px; border-top-color: #EDEFF2; border-top-style: solid; border-top-width: 1px; box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif; margin: 0; padding: 0; width: 100%; word-break: break-word; border-top: 4px solid #267fed;" bgcolor="#FFFFFF">
                <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif; margin: 0 auto; padding: 0; width: 570px;" bgcolor="#FFFFFF">

                  <tr>
                    <td class="content-cell" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif; padding: 35px; word-break: break-word;">
                      <h1 style="box-sizing: border-box; color: #2b333f; font-family: 'Helvetica Neue', Helvetica, sans-serif; font-size: 19px; font-weight: bold; margin-top: 0;" align="left">Dapp Created!</h1>
                      <p style="box-sizing: border-box; color: #626b76; font-family: 'Helvetica Neue', Helvetica, sans-serif; font-size: 16px; line-height: 1.5em; margin-top: 0;" align="left">Congratulations! You just created and deployed <strong>${dappname}</strong>. Use the link below to view and interact with your new Dapp.</p>

                      <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif; margin: 30px auto; padding: 0; text-align: center; width: 100%;">
                        <tr>
                          <td align="center" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif; word-break: break-word;">

                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif;">
                              <tr>
                                <td align="center" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif; word-break: break-word;">
                                  <table border="0" cellspacing="0" cellpadding="0" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif;">
                                    <tr>
                                      <td style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif; word-break: break-word;">
                                        <a href="${dappDNS}" class="button button--" style="-webkit-text-size-adjust: none; background: #007ef5; border-color: #007ef5; border-radius: 3px; border-style: solid; border-width: 10px 18px; box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16); box-sizing: border-box; color: #FFF; display: inline-block; font-family: 'Helvetica Neue', Helvetica, sans-serif; text-decoration: none;">${dappDNS}</a>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <p style="box-sizing: border-box; color: #626b76; font-family: 'Helvetica Neue', Helvetica, sans-serif; font-size: 16px; line-height: 1.5em; margin-top: 0;" align="left">Thank you,
                        <br />DappBot Team</p>
                      <p style="box-sizing: border-box; color: #626b76; font-family: 'Helvetica Neue', Helvetica, sans-serif; font-size: 16px; line-height: 1.5em; margin-top: 0;" align="left"><strong style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif;">P.S.</strong> Please do not reply to this email. This email is generated automatically, and is not monitored for responses. We will never ask you to send sensitive information via email or via a link in an email.</p>

                      <table class="body-sub" style="border-top-color: #EDEFF2; border-top-style: solid; border-top-width: 1px; box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif; margin-top: 25px; padding-top: 25px;">
                        <tr>
                          <td style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif; word-break: break-word;">
                            <p class="sub" style="box-sizing: border-box; color: #626b76; font-family: 'Helvetica Neue', Helvetica, sans-serif; font-size: 12px; line-height: 1.5em; margin-top: 0;" align="left">If any issues arise, please reach out for support at our <a href="https://eximchain.zendesk.com/" style="box-sizing: border-box; color: #007ef5; font-family: 'Helvetica Neue', Helvetica, sans-serif;">help center.</a></p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif; word-break: break-word; background: white;">
                <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif; margin: 0 auto; padding: 0; text-align: center; width: 570px;">
                  <tr>
                    <td class="content-cell" align="center" style="box-sizing: border-box; font-family: 'Helvetica Neue', Helvetica, sans-serif; padding: 35px; word-break: break-word;">
                      <p class="sub align-center" style="box-sizing: border-box; color: #AEAEAE; font-family: 'Helvetica Neue', Helvetica, sans-serif; font-size: 12px; line-height: 1.5em; margin-top: 0;" align="center">© 2019 Eximchain. All rights reserved.</p>
                      <p class="sub align-center" style="box-sizing: border-box; color: #AEAEAE; font-family: 'Helvetica Neue', Helvetica, sans-serif; font-size: 12px; line-height: 1.5em; margin-top: 0;" align="center">
                        Eximchain
                        <br />#02-00, 22 North Canal Road
                        <br />Singapore 048834
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export default createDappEmail;