const fs = require('fs-extra');
const path = require('path');
import Handlebars from './handlebars'

export const loadTemplate = (templatePath:string) => {
    return String(fs.readFileSync(path.resolve(__dirname, templatePath)))
}

export const writeTemplateToPath = (templatePath:string, filePath:string, templateArg:any={}) => {
    const templateCode = Handlebars.compile(loadTemplate(templatePath))(templateArg)
    fs.writeFileSync(filePath, templateCode);
}