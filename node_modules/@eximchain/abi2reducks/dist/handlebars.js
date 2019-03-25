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
    var Handlebars = require("handlebars");
    var hasMixedChars = function (input) { return /[a-z]/.test(input) && /[A-Z]/.test(input); };
    var lowCaseAllUpcase = function (input) { return hasMixedChars(input) ? input : input.toLowerCase(); };
    var capitalize = function (input) { return input.charAt(0).toUpperCase() + input.slice(1); };
    var snakeToPascal = function (input) { return input.split('_').map(lowCaseAllUpcase).map(capitalize).join(''); };
    var firstCharLow = function (input) { return input.charAt(0).toLowerCase() + input.slice(1); };
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
    exports.camelCase = function (input) {
        if (input.indexOf('_') != -1) {
            return firstCharLow(snakeToPascal(input));
        }
        else {
            return firstCharLow(input);
        }
    };
    Handlebars.registerHelper({
        logconsole: function () {
            var args = Array.prototype.slice.call(arguments);
            console.log(args.splice(args.length - 1));
        },
        upper: function (input) {
            return input.toUpperCase();
        },
        camelCase: function (input) {
            return exports.camelCase(input);
        },
        pascalCase: function (input) {
            return exports.pascalCase(input);
        },
        inputList: function (inputs) {
            return inputs.map(function (input) { return input.name !== "" ? input.name : input.type; }).join(', ');
        },
        inputSpread: function (inputs) {
            if (inputs.length > 0)
                return ', ' + inputs.map(function (input) { return input.name !== "" ? input.name : input.type; }).join(', ');
            return '';
        },
        solToJSType: function (input) {
            return input === 'bool' ? 'boolean' : 'string';
        },
        stringify: function (input) {
            return JSON.stringify(input, null, 2);
        }
    });
    exports.default = Handlebars;
});
//# sourceMappingURL=handlebars.js.map