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
    /**
     * Given the ABI for a method, return an object
     * with SET & SUBMIT action names which are scoped
     * to the method.
     *
     * @param method:MethodAbi
     */
    exports.actionNames = function (method) {
        return {
            SET: "method/" + method.name + "/set",
            SUBMIT: "method/" + method.name + "/submit"
        };
    };
});
//# sourceMappingURL=actions.js.map