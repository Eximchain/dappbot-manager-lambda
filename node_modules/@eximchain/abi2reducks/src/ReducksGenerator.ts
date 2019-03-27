
import {MethodAbi} from 'ethereum-types';
import { pascalCase, camelCase } from './handlebars'
const shell = require('shelljs');
let path = require("path");
let fs = require("fs-extra");

const { writeTemplateToPath, writeTxDuck } = require('./util');

export type ReducksInput = {
    abi: MethodAbi[],
    address: string,
    web3URL: string
}

export type ReducksData = {
    START_DIR: string,
    REDUCKS_DIR: string,
    ABI: MethodAbi[],
    REUSABLE_DIR: string,
    CONTRACT_ADDR: string,
    WEB3_URL: string
}

const getReducksData:(input:ReducksInput)=>ReducksData = ({abi, address, web3URL}) => {
    const cwd = process.cwd();
    return {
        START_DIR: cwd,
        REDUCKS_DIR: `${cwd}/txDucks`,
        ABI: abi.filter(fxn => fxn.type === 'function'),
        REUSABLE_DIR: path.resolve(__dirname, '../src/reusable'),
        CONTRACT_ADDR: address,
        WEB3_URL: web3URL
    }
}

export const generate:(input:ReducksInput)=>void = (input) => {
    const data = getReducksData(input);
    shell.cd(data.START_DIR);
    // cd into directory and create folder for each ABI method
    writeTemplateToPath('./templates/state_index.hbs', './index.ts');
    writeTemplateToPath('./templates/store.hbs', './store.ts');
    writeTemplateToPath('./templates/contract.hbs', './Contract.ts', {
        abi : data.ABI,
        web3URL : data.WEB3_URL,
        contractAddress : data.CONTRACT_ADDR
    })
    fs.copySync(data.REUSABLE_DIR, path.resolve(process.cwd(), './reusable'))
    fs.ensureDirSync(data.REDUCKS_DIR);
    shell.cd(data.REDUCKS_DIR);
    writeTemplateToPath('./templates/ducks_index.hbs', './index.ts', { abi : data.ABI })
    data.ABI.forEach(fxn => writeTxDuck(fxn));
}