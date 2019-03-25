(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "web3-utils", "./types"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var web3Utils = require("web3-utils");
    var BigNum = require('bignumber.js');
    var types_1 = require("./types");
    /**
     * Given a method ABI, return an object whose keys
     * are the inputs names and whose values are their
     * Solidity types.
     *
     * @param fxn
     */
    exports.buildInputTypeMap = function (fxn) {
        return fxn.inputs.reduce(function (typeMap, _a, index) {
            var name = _a.name, type = _a.type;
            typeMap[name || "arg-" + index] = type;
            return typeMap;
        }, {});
    };
    exports.cleanTypedValue = function (name, type, value) {
        if (Object.values(types_1.NumberTypeStrings).includes(type)) {
            return [value.replace(/\D/g, ''), null];
        }
        else if (Object.values(types_1.ByteTypeStrings).includes(type)) {
            if (web3Utils.isHexStrict(value)) {
                return [value, null];
            }
            else {
                return [null, name + " is byte data which must be encoded in hex, beginning with an 0x."];
            }
        }
        else {
            switch (type) {
                case ('bool'):
                    if (typeof value === 'boolean') {
                        return [value, null];
                    }
                    else {
                        return [null, "Provided value for " + name + " was not a boolean."];
                    }
                case ('string'):
                    if (typeof value === 'string') {
                        return [value, null];
                    }
                    else {
                        return [null, "Provided value for " + name + " was not a string."];
                    }
                case ('address'):
                    if (typeof value !== 'string') {
                        return [null, "Provided value for " + name + " was not a string."];
                    }
                    else if (value.length >= 2 && value.slice(0, 2) !== '0x') {
                        return [null, name + " is an address and must begin with 0x."];
                    }
                    else if (value.length > 42) {
                        return [null, name + " is an address; it is only 42 characters long, not " + value.length + "."];
                    }
                    else {
                        return [value, null];
                    }
                default:
                    throw new Error("selectFieldType received a value it did not not how to handle: " + type);
            }
        }
    };
    exports.validateTypedValue = function (name, type, value) {
        if (Object.values(types_1.NumberTypeStrings).includes(type)) {
            return validateNumber(name, type, value);
        }
        else if (Object.values(types_1.ByteTypeStrings).includes(type)) {
            return web3Utils.isHexStrict(value) ? null : name + " bytes must be encoded in hex, beginning with an 0x.";
        }
        else {
            switch (type) {
                case ('bool'):
                    return typeof value === 'boolean' ? null : name + " must be boolean, true or false.";
                case ('string'):
                    return typeof value === 'string' ? null : name + " must be a string, type was instead " + typeof value + ".";
                case ('address'):
                    if (typeof value !== 'string')
                        return name + " must be an address string, type was instead " + typeof value + ".";
                    if (value.length !== 42 || value.slice(0, 2) !== '0x') {
                        return name + " must be a hex address; 42 characters total, beginning with 0x.";
                    }
                    if (web3Utils.isAddress(value.toLowerCase())) {
                        return null;
                    }
                    else {
                        return name + " was not a valid address, double-check you wrote it correctly.";
                    }
                default:
                    throw new Error("selectFieldType received a value it did not not how to handle: " + type);
            }
        }
    };
    var validateNumber = function (name, type, value) {
        if (typeof value !== 'string') {
            return name + " was not a string, its type was instead: " + value + ".";
        }
        else {
            var isSigned = type.charAt(0) === 'i';
            var numBits = /[0-9]/.test(type) ?
                parseInt(isSigned ? type.slice(3) : type.slice(4)) :
                256;
            if (Object.values(types_1.Uints).includes(type)) {
                var maxVal = new BigNum(2).exponentiatedBy(numBits);
                var val = new BigNum(value);
                return val.gte(0) && val.lte(maxVal) ? null : name + " only accepts numbers between 0 and " + maxVal.toString() + ".";
            }
            else if (Object.values(types_1.Ints).includes(type)) {
                var maxMagnitude = new BigNum(2).exponentiatedBy(numBits - 1);
                var val = new BigNum(value);
                return val.gte(maxMagnitude.negated()) && val.lte(maxMagnitude) ? null : name + " only accepts numbers between -" + maxMagnitude + " and " + maxMagnitude + ".";
            }
            else {
                return "validateNumber was given an unknown type for " + name + ": " + type;
            }
        }
    };
    var capitalize = function (input) { return input.charAt(0).toUpperCase() + input.slice(1); };
    /**
     * Given a string in either camel or snake case, return it in pascalCase (i.e. titleCase)
     * @param input
     */
    exports.pascalCase = function (input) {
        if (input.indexOf('_') != -1) {
            return input.split('_').map(capitalize).join('');
        }
        else {
            return capitalize(input);
        }
    };
});
//# sourceMappingURL=util.js.map