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
    var shell = require('shelljs');
    var handlebars_1 = require("./handlebars");
    exports.loadTemplate = function (templatePath) {
        return String(fs.readFileSync(path.resolve(__dirname, templatePath)));
    };
    exports.writeTemplateToPath = function (templatePath, filePath, templateArg) {
        if (templateArg === void 0) { templateArg = {}; }
        var templateCode = handlebars_1.default.compile(exports.loadTemplate(templatePath))(templateArg);
        fs.writeFileSync(filePath, templateCode);
    };
    exports.writeTxDuck = function (method) {
        var dirName = handlebars_1.camelCase(method.name);
        fs.ensureDirSync(dirName);
        shell.cd(dirName);
        var templateArg = {
            methodName: method.name,
            methodAbi: method,
            titleName: handlebars_1.pascalCase(method.name)
        };
        exports.writeTemplateToPath('./templates/duck/index.hbs', './index.ts', templateArg);
        exports.writeTemplateToPath('./templates/duck/actions.hbs', './actions.ts', templateArg);
        exports.writeTemplateToPath('./templates/duck/reducers.hbs', './reducers.ts', templateArg);
        exports.writeTemplateToPath('./templates/duck/selectors.hbs', './selectors.ts', templateArg);
        exports.writeTemplateToPath('./templates/duck/types.hbs', './types.ts', templateArg);
        shell.cd('..');
    };
});
//# sourceMappingURL=util.js.map