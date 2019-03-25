// Sample of a generated Contract file, only included here so that the reusable code
// doesn't throw an error about a missing import.

const Web3 = require('web3');
const web3 = new Web3('https://gamma-tx-executor-us-east.eximchain-dev.com');
export default new web3.eth.Contract(require('./contract.json'));