(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./util", "../Contract"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require("./util");
    var Contract_1 = require("../Contract");
    /**
     * Factory which accepts a MethodAbi and produces 2 selector functions:
     * selectMethod - retrieves a given method's MethodState (i.e. params, error)
     * selectData - computes the encoded `data` field given the current params
     * @param method:MethodAbi
     */
    exports.selectorsFactory = function (method) {
        var selectMethod = function (state) { return state[util_1.pascalCase(method.name) + "Reducer"]; };
        var selectData = function (state) {
            var _a;
            var methodState = selectMethod(state);
            var paramTypes = method.inputs.map(function (_a) {
                var type = _a.type;
                return type;
            });
            var methodName = method.name + "(" + paramTypes.join(',') + ")";
            try {
                return (_a = Contract_1.default.methods)[methodName].apply(_a, method.inputs.map(function (_a, index) {
                    var name = _a.name;
                    var paramName = name === "" ? "arg-" + index : name;
                    return methodState.params[paramName];
                })).encodeABI();
            }
            catch (_b) {
                return 'Arguments do not yet produce valid data.';
            }
        };
        return { selectMethod: selectMethod, selectData: selectData };
    };
});
//# sourceMappingURL=selectors.js.map