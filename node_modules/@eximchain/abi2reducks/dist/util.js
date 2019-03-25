(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./handlebars"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fs = require('fs-extra');
    var path = require('path');
    var handlebars_1 = require("./handlebars");
    exports.loadTemplate = function (templatePath) {
        return String(fs.readFileSync(path.resolve(__dirname, templatePath)));
    };
    exports.writeTemplateToPath = function (templatePath, filePath, templateArg) {
        if (templateArg === void 0) { templateArg = {}; }
        var templateCode = handlebars_1.default.compile(exports.loadTemplate(templatePath))(templateArg);
        fs.writeFileSync(filePath, templateCode);
    };
});
//# sourceMappingURL=util.js.map