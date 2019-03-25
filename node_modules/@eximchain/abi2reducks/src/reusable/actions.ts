import { MethodAbi } from 'ethereum-types';

/**
 * Given the ABI for a method, return an object
 * with SET & SUBMIT action names which are scoped
 * to the method.
 * 
 * @param method:MethodAbi
 */
export const actionNames = (method:MethodAbi) => {
    return {
        SET : `method/${method.name}/set`,
        SUBMIT: `method/${method.name}/submit`
    }
}