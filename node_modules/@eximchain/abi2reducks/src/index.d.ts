// Type definitions for @eximchain/abi2reducks

import { MethodAbi } from 'ethereum-types';

export interface Input {
    abi: MethodAbi[],
    address: string,
    web3URL: string
}

export function generate(input:Input): void;