import React, { Fragment, FunctionComponent } from 'react';
import { DataItem } from 'ethereum-types';
import { AddressField, BooleanField, ByteField, NumberField, NumberTypes, StringField, Fields, selectFieldType, selectNumberType  } from './fields';
// @ts-ignore Will be present upon component generation
import { ParamValue, MethodState } from '../../state/reusable/types';

interface Props {
    inputs: DataItem[]
    onChange: (name:string,value:ParamValue)=>void,
    values: MethodState
}

export const FieldList:FunctionComponent<Props> = ({ inputs, onChange, values }) => {
    const fields = inputs.map(({name, type}, index) => {
        const fieldName = name || `arg-${index}`;
        const fieldType = selectFieldType(type);
        const namedSetter = (val:ParamValue) => { onChange(fieldName, val)}
        const value = values.params[fieldName];
        switch (fieldType){
            case (Fields.Address):
                return (
                    <AddressField name={fieldName} 
                        value={value as string} 
                        key={fieldName}
                        onChange={namedSetter}
                        displayName={fieldName} />
                )
            case (Fields.Boolean):
                return (
                    <BooleanField name={fieldName} 
                        value={value as boolean} 
                        key={fieldName}
                        onChange={namedSetter} 
                        displayName={fieldName} />
                )
            case (Fields.Bytes):
                return (
                    <ByteField name={fieldName} 
                        value={value as string} 
                        key={fieldName}
                        onChange={namedSetter} 
                        displayName={fieldName} />
                )
            case (Fields.Number):
                // @ts-ignore Make Typescript shut up about whether
                // this will be a correct string
                const numType:NumberTypes = type;
                return (
                    <NumberField name={fieldName} 
                        value={value as string} 
                        size={numType}
                        key={fieldName}
                        onChange={namedSetter} 
                        displayName={fieldName} />
                )
            case (Fields.String):
                return (
                    <StringField name={fieldName} 
                        value={value as string} 
                        key={fieldName}
                        onChange={namedSetter} 
                        displayName={fieldName} />
                )
        }
    })
    return (
        <Fragment>
            { fields }
        </Fragment>
    )
}

export default FieldList;