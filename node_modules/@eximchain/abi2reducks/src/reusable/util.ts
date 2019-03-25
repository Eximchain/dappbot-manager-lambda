import { MethodAbi } from "ethereum-types";
import * as web3Utils from 'web3-utils';
const BigNum = require('bignumber.js');

import { 
    NumberTypeStrings, ByteTypeStrings, Uints, Ints, InputMap
} from './types';

/**
 * Given a method ABI, return an object whose keys
 * are the inputs names and whose values are their
 * Solidity types.
 * 
 * @param fxn 
 */
export const buildInputTypeMap:(fxn:MethodAbi)=>InputMap = (fxn:MethodAbi) => {
    return fxn.inputs.reduce((typeMap, {name, type}, index) => {
        typeMap[name || `arg-${index}`] = type;
        return typeMap;
    }, {})
}

export const cleanTypedValue:(name:string,type:string,value:any)=>[any,string|null] = (name, type, value) => {
    if (Object.values(NumberTypeStrings).includes(type)){
        return [value.replace(/\D/g, ''), null];
    } else if (Object.values(ByteTypeStrings).includes(type)){
        if (web3Utils.isHexStrict(value)){
            return [value, null]
        } else {
            return [null, `${name} is byte data which must be encoded in hex, beginning with an 0x.`];
        }
    } else {
        switch (type) {
            case ('bool'):
                if (typeof value === 'boolean'){
                    return [value, null]
                } else {
                    return [null, `Provided value for ${name} was not a boolean.`]
                }
            case ('string'):
                if (typeof value === 'string'){
                    return [value, null]
                } else {
                    return [null, `Provided value for ${name} was not a string.`];
                }
            case ('address'):
                if (typeof value !== 'string'){
                    return [null, `Provided value for ${name} was not a string.`];
                } else if (value.length >= 2 && value.slice(0,2) !== '0x') {
                    return [null, `${name} is an address and must begin with 0x.`]
                } else if (value.length > 42) {
                    return [null, `${name} is an address; it is only 42 characters long, not ${value.length}.`];
                } else {
                    return [value, null]
                }
            default:
                throw new Error(`selectFieldType received a value it did not not how to handle: ${type}`);
        }
    }
}

export const validateTypedValue:(name:string, type:string,value:any)=>string | null = (name, type, value) => {
    if (Object.values(NumberTypeStrings).includes(type)){
        return validateNumber(name,type,value);
    } else if (Object.values(ByteTypeStrings).includes(type)){
        return web3Utils.isHexStrict(value) ? null : `${name} bytes must be encoded in hex, beginning with an 0x.`
    } else {
        switch (type) {
            case ('bool'):
                return typeof value === 'boolean' ? null : `${name} must be boolean, true or false.`
            case ('string'):
                return typeof value === 'string' ? null : `${name} must be a string, type was instead ${typeof value}.`;
            case ('address'):
                if (typeof value !== 'string') return `${name} must be an address string, type was instead ${typeof value}.`
                if (value.length !== 42 || value.slice(0,2) !== '0x') {
                    return `${name} must be a hex address; 42 characters total, beginning with 0x.`
                }
                if (web3Utils.isAddress(value.toLowerCase())){
                    return null;
                } else {
                    return `${name} was not a valid address, double-check you wrote it correctly.`
                }
            default:
                throw new Error(`selectFieldType received a value it did not not how to handle: ${type}`);
        }
    }
}

const validateNumber:(name:string,type:string,value:any)=>string | null = (name,type,value)=>{
    if (typeof value !== 'string'){
        return `${name} was not a string, its type was instead: ${value}.`;
    } else {
        const isSigned = type.charAt(0) === 'i';
        const numBits = /[0-9]/.test(type) ? 
            parseInt(isSigned ? type.slice(3) : type.slice(4)) : 
            256;
        if (Object.values(Uints).includes(type)){
            let maxVal = new BigNum(2).exponentiatedBy(numBits);
            let val = new BigNum(value);
            return val.gte(0) && val.lte(maxVal) ? null : `${name} only accepts numbers between 0 and ${maxVal.toString()}.`
        } else if (Object.values(Ints).includes(type)){
            let maxMagnitude = new BigNum(2).exponentiatedBy(numBits - 1);
            let val = new BigNum(value);
            return val.gte(maxMagnitude.negated()) && val.lte(maxMagnitude) ? null : `${name} only accepts numbers between -${maxMagnitude} and ${maxMagnitude}.`;
        } else {
            return `validateNumber was given an unknown type for ${name}: ${type}`;
        }
    }
}

const capitalize = (input:string) => input.charAt(0).toUpperCase() + input.slice(1);

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