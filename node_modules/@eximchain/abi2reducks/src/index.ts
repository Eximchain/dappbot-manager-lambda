#!/usr/bin/env node

import { AbiDefinition } from "ethereum-types";
import { generate } from './ReducksGenerator';
let fs = require("fs");
let path = require("path");
const program = require('commander');
const npmPackage = JSON.parse(fs.readFileSync(path.resolve(__dirname, './../package.json')));

program
    .version(npmPackage.version)
    .name(npmPackage.name)
    .description(npmPackage.description)
    .usage('<contract_path> <contract_address> <web3URL>')
    .action((contract_path:string, contract_address:string, web3URL: string) => {
        const abiMethods = require(path.resolve(process.cwd(), contract_path)).filter((fxn:AbiDefinition) => fxn.type === 'function');
        generate({abi: abiMethods, address: contract_address, web3URL: web3URL })
    })

program.on('--help', () => {
    console.log('');
    console.log('  Call with a path to your smart contract ABI, its deployed address, and an HTTPProvider URL.  Will generate the DApp in a folder named `ducks');
    console.log('');
})

if (require.main === module){
    const args = process.argv.slice(2)
    if (args.length != 2){
        program.help();
    } else {
        program.parse(process.argv);
    }
}

export default { generate }