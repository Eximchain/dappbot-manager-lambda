const { AWS, r53HostedZoneId, dnsRoot } = require('../env');
const route53 = new AWS.Route53({apiVersion: '2013-04-01'});

function promiseCreateDnsRecord(dappName, cloudfrontDns) {
    // TODO: Sanitize for URL
    let name = dnsNameFromDappName(dappName);
    let params = {
        HostedZoneId: r53HostedZoneId,
        ChangeBatch: {
            Changes: [{
                Action: 'CREATE',
                ResourceRecordSet: {
                    AliasTarget: {
                        DNSName: cloudfrontDns, 
                        EvaluateTargetHealth: false, 
                        HostedZoneId: "Z2FDTNDATAQYW2"
                    },
                    Name: name, 
                    Type: "A"
                }
            }]
        }
    }
    return route53.changeResourceRecordSets(params).promise();
}

function promiseDeleteDnsRecord(dappName, cloudfrontDns) {
    // TODO: Sanitize for URL
    let name = dnsNameFromDappName(dappName);
    let params = {
        HostedZoneId: r53HostedZoneId,
        ChangeBatch: {
            Changes: [{
                Action: 'DELETE',
                ResourceRecordSet: {
                    AliasTarget: {
                        DNSName: cloudfrontDns, 
                        EvaluateTargetHealth: false, 
                        HostedZoneId: "Z2FDTNDATAQYW2"
                    }, 
                    Name: name, 
                    Type: "A"
                }
            }]
        }
    }
    return route53.changeResourceRecordSets(params).promise();
}

function dnsNameFromDappName(dappName) {
    return dappName.concat(dnsRoot);
}

module.exports = {
    createRecord : promiseCreateDnsRecord,
    deleteRecord : promiseDeleteDnsRecord,
    dappDNS : dnsNameFromDappName
}