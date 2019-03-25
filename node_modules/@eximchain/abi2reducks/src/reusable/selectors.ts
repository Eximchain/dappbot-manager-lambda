import { MethodAbi } from 'ethereum-types';
import { MethodState, AllMethodState } from './types';
import { pascalCase } from './util';
import Contract from '../Contract';

/**
 * Factory which accepts a MethodAbi and produces 2 selector functions:
 * selectMethod - retrieves a given method's MethodState (i.e. params, error)
 * selectData - computes the encoded `data` field given the current params
 * @param method:MethodAbi
 */
export const selectorsFactory = (method:MethodAbi) => {
    const selectMethod = (state:AllMethodState) => state[`${pascalCase(method.name)}Reducer`]
    const selectData = (state:AllMethodState) => {
        const methodState:MethodState = selectMethod(state);
        let paramTypes = method.inputs.map(({type})=>type)
        let methodName = `${method.name}(${paramTypes.join(',')})`;
        try {
            return Contract.methods[methodName](...method.inputs.map(
                ({name}, index)=>{
                    let paramName = name === "" ? `arg-${index}` : name;
                    return methodState.params[paramName]
                }
            )).encodeABI()
        } catch {
            return 'Arguments do not yet produce valid data.'
        }
    }
    return { selectMethod, selectData }
}