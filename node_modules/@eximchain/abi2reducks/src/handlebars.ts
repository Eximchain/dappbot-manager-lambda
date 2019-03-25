import {DataItem} from 'ethereum-types';
let Handlebars = require("handlebars");

const hasMixedChars = (input:string) => /[a-z]/.test(input) && /[A-Z]/.test(input);
const lowCaseAllUpcase = (input:string) => hasMixedChars(input) ? input : input.toLowerCase();
const capitalize = (input:string) => input.charAt(0).toUpperCase() + input.slice(1);
const snakeToPascal = (input:string) => input.split('_').map(lowCaseAllUpcase).map(capitalize).join('')
const firstCharLow = (input:string) => input.charAt(0).toLowerCase() + input.slice(1);
/**
 * Given a string in either camel or snake case, return it in pascalCase (i.e. titleCase)
 * @param input 
 */
export const pascalCase = (input:string) => {
    if (input.indexOf('_') != -1){
        return input.split('_').map(capitalize).join('')
    } else {
        return capitalize(input);
    }
}

export const camelCase = (input:string) => {
    if (input.indexOf('_') != -1){
        return firstCharLow(snakeToPascal(input));
      } else {
        return firstCharLow(input);
      }
}

Handlebars.registerHelper({
   
    logconsole(){
        let args = Array.prototype.slice.call(arguments);
        console.log(args.splice(args.length -1 ));
    },
    upper(input:string){
        return input.toUpperCase()
    },
    camelCase(input:string) {
        return camelCase(input);
    },
    pascalCase(input: string){
        return pascalCase(input)
    },
    inputList(inputs:DataItem[]){
        return inputs.map(input => input.name !== "" ? input.name : input.type).join(', ');
    },
    inputSpread(inputs:DataItem[]){
        if (inputs.length > 0) return ', '+inputs.map(input => input.name !== "" ? input.name : input.type).join(', ');
        return '';
    },
    solToJSType(input:string){
        return input === 'bool' ? 'boolean' : 'string';
    },
    stringify(input:Object){
        return JSON.stringify(input, null, 2)
    }
});

export default Handlebars