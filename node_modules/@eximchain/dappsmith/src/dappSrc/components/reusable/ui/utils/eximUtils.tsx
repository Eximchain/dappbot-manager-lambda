import * as ethUtils from "ethereumjs-util";
import { BigNumber as BNJS } from "bignumber.js";

BNJS.config({ EXPONENTIAL_AT: 18 });

export const BigNumber = ethUtils.BN;

const isHex = (str: string) => typeof str === "string" && str.startsWith("0x");
export const toBN = (str: string) => new BNJS(str);
export const hexToNumberString = (str: string) => toBN(str).toString(10);

export const isAddress = (str: string) => isHex(str) && str.length === 42;

export const toBigNumber = (str: string) => {
  /**
   web3.utils.isHex(estimatedGas)
      ? new BigNumber(web3.utils.hexToNumberString(estimatedGas))
      : new BigNumber(estimatedGas)
   */
  return isHex(str) ? new BNJS(hexToNumberString(str)) : new BNJS(str);
};

export const weiToEther = (valWei: string) => {
  return toBigNumber(valWei).div(new BNJS("1000000000000000000"));
};

export const etherToGwei = (valEther: string) => {
  return new BNJS(valEther).times(new BNJS("1000000000"));
};

export const etherToWei = (valEther: string) => {
  return new BNJS(valEther).times(new BNJS("1000000000000000000"));
};

export const toUsd = (etherAmount = "0", etherPriceUSD: any) => {
  return parseFloat(
    toBigNumber(etherAmount)
      .times(toBigNumber(etherPriceUSD))
      .toString()
  ).toFixed(2);
};

export const networkIdToName = (networkId: number) => {
  switch (networkId) {
    case 1:
      return "Main";
    case 3:
      return "Ropsten";
    case 4:
      return "Rinkeby";
    case 42:
      return "Kovan";
    default:
      return "Private";
  }
};

// FIXME wrapper for EthTools.formatBalance
export const formatBalance = () => {};

export function formatTokenCount(value: any, decimals: any) {
  return Number(value / 10 ** decimals).toString();
}

export function formatFunctionName(functionName: string) {
  if (functionName === undefined) {
    throw new Error("formatFunctionName() expects a non-empty string");
  }

  return functionName
    .slice(0, functionName.indexOf("("))
    .replace(/_+/g, " ")
    .replace(/([A-Z]+|[0-9]+)/g, " $1")
    .toLowerCase()
    .trim();
}
