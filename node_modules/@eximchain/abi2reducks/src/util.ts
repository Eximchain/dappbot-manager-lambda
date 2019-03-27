const fs = require('fs-extra');
const path = require('path');
const shell = require('shelljs');
import Handlebars, { camelCase, pascalCase } from './handlebars'
import { MethodAbi } from 'ethereum-types';

export const loadTemplate = (templatePath:string) => {
    return String(fs.readFileSync(path.resolve(__dirname, templatePath)))
}

export const writeTemplateToPath = (templatePath:string, filePath:string, templateArg:any={}) => {
    const templateCode = Handlebars.compile(loadTemplate(templatePath))(templateArg)
    fs.writeFileSync(filePath, templateCode);
}

export const writeTxDuck = (method:MethodAbi) => {
    const dirName = camelCase(method.name);
    fs.ensureDirSync(dirName)
    shell.cd(dirName);
    const templateArg = {
        methodName : method.name,
        methodAbi : method,
        titleName : pascalCase(method.name)
    };
    writeTemplateToPath('./templates/duck/index.hbs', './index.ts', templateArg);
    writeTemplateToPath('./templates/duck/actions.hbs', './actions.ts', templateArg);
    writeTemplateToPath('./templates/duck/reducers.hbs', './reducers.ts', templateArg)
    writeTemplateToPath('./templates/duck/selectors.hbs', './selectors.ts', templateArg);
    writeTemplateToPath('./templates/duck/types.hbs', './types.ts', templateArg);
    shell.cd('..');
}