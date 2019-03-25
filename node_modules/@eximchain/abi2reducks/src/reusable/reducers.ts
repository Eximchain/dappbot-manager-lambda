import { MethodAbi } from 'ethereum-types';
const merge = require('lodash.merge');
import { actionNames } from './actions';
import { 
    NumberTypeStrings, ByteTypeStrings, Action, MethodState, SetParamPayload
} from './types';
import {
    buildInputTypeMap, cleanTypedValue, validateTypedValue
} from './util';

/**
 * Given an ABI method, returns a default fxnReducer state
 * based on the method's inputs.  All non-bool values are
 * actually strings.  Starts with an error key set to null.
 * 
 * @param method 
 */
const initialStateFromTypes:(method:MethodAbi)=>MethodState = (method:MethodAbi) => {
    return { 
        params : method.inputs.reduce((state, input, i) => {
            let { type, name } = input;
            let fieldName = name || `arg${i}`;
            let initialValue;

            if (type === 'address'){
                initialValue = '0x'
            } else if (type === 'string'){
                initialValue = ''
            } else if (type === 'bool') {
                initialValue = true;
            } else if (NumberTypeStrings.includes(type)) {
                initialValue = '0'
            } else if (ByteTypeStrings.includes(type)){
                initialValue = ''
            } else {
                throw new Error(`initialStateFromTypes received a type it was not expecting: ${type}`);
            }

            state[fieldName] = initialValue;
            return state;
        }, {}),
        error : null
    };
}

/**
 * Factory to produce a reducer for one ABI method.
 * It accepts SET and SUBMIT actions, maintaining and
 * type-checking each parameter.  If there are type
 * errors, it updates an `error` field to either an
 * error string or an array of them.
 * 
 * @param method:MethodAbi
 */
export const methodReducer = (method: MethodAbi) => {
    const initialState = initialStateFromTypes(method);
    const typesByField = buildInputTypeMap(method);
    const actions = actionNames(method);
    return (state=initialState, { type, payload }:Action) => {
        switch(type){
            case (actions.SET):
                const { fieldName, value } = <SetParamPayload> payload;
                const [cleanVal, error] = cleanTypedValue(fieldName, typesByField[fieldName], value);
                if (error){
                    return merge({}, state, { error })
                } else {
                    let newVal = {};
                    newVal[fieldName] = cleanVal;
                    return merge({}, state, { params : { ...newVal }, error: null });
                }
            case (actions.SUBMIT):
                const errors = Object.keys(state.params).reduce((errs:string[], name:string)=>{
                    let err = validateTypedValue(name, typesByField[name], state.params[name]);
                    if (err !== null) errs.push(err.toString());
                    return errs;
                }, []);
                if (errors.length > 0){
                    return merge({}, state, { error: errors })
                } else {
                    return merge({}, initialState);
                }
            default:
                return state;
        }
    }
}