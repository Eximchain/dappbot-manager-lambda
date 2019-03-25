// Sample of a generated Contract file, only included here so that the reusable code
// doesn't throw an error about a missing import.
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Web3 = require('web3');
    var web3 = new Web3('https://gamma-tx-executor-us-east.eximchain-dev.com');
    exports.default = new web3.eth.Contract(require('./contract.json'));
});
//# sourceMappingURL=Contract.js.map