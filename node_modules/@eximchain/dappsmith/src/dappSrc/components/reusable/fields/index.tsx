import AddressField from './AddressField';
import BooleanField from './BooleanField';
import ByteField, { ByteTypeStrings } from './ByteField';
import { NumberTypeStrings } from './NumberField';
import StringField from './StringField';

export enum Fields {
    Address,
    Boolean,
    Bytes,
    Number,
    String
}

export * from './NumberField';

export const selectFieldType = (type:string) => {
    if (Object.values(NumberTypeStrings).includes(type)){
        return Fields.Number;
    } else if (Object.values(ByteTypeStrings).includes(type)){
        return Fields.Bytes;
    } else {
        switch (type) {
            case ('bool'):
                return Fields.Boolean;
            case ('string'):
                return Fields.String;
            case ('address'):
                return Fields.Address;
            default:
                throw new Error(`selectFieldType received a value it did not not how to handle: ${type}`);
        }
    }
}

export {
    AddressField,
    BooleanField,
    ByteField,
    ByteTypeStrings,
    StringField
}