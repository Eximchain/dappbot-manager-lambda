export enum Bytes {
    dynamic = "bytes",
    size1 = "bytes1",
    size2 = "bytes2",
    size3 = "bytes3",
    size4 = "bytes4",
    size5 = "bytes5",
    size6 = "bytes6",
    size7 = "bytes7",
    size8 = "bytes8",
    size9 = "bytes9",
    size10 = "bytes10",
    size11 = "bytes11",
    size12 = "bytes12",
    size13 = "bytes13",
    size14 = "bytes14",
    size15 = "bytes15",
    size16 = "bytes16",
    size17 = "bytes17",
    size18 = "bytes18",
    size19 = "bytes19",
    size20 = "bytes20",
    size21 = "bytes21",
    size22 = "bytes22",
    size23 = "bytes23",
    size24 = "bytes24",
    size25 = "bytes25",
    size26 = "bytes26",
    size27 = "bytes27",
    size28 = "bytes28",
    size29 = "bytes29",
    size30 = "bytes30",
    size31 = "bytes31",
    size32 = "bytes32"
}

export const ByteTypeStrings = Object.values(Bytes);

export enum Uints {
    base = "uint",
    size8 = "uint8",
    size16 = "uint16",
    size24 = "uint24",
    size32 = "uint32",
    size40 = "uint40",
    size48 = "uint48",
    size56 = "uint56",
    size64 = "uint64",
    size72 = "uint72",
    size80 = "uint80",
    size88 = "uint88",
    size96 = "uint96",
    size104 = "uint104",
    size112 = "uint112",
    size120 = "uint120",
    size128 = "uint128",
    size136 = "uint136",
    size144 = "uint144",
    size152 = "uint152",
    size160 = "uint160",
    size168 = "uint168",
    size176 = "uint176",
    size184 = "uint184",
    size192 = "uint192",
    size200 = "uint200",
    size208 = "uint208",
    size216 = "uint216",
    size224 = "uint224",
    size232 = "uint232",
    size240 = "uint240",
    size248 = "uint248",
    size256 = "uint256"
}

export enum Ints {
    base = "int",
    size8 = "int8",
    size16 = "int16",
    size24 = "int24",
    size32 = "int32",
    size40 = "int40",
    size48 = "int48",
    size56 = "int56",
    size64 = "int64",
    size72 = "int72",
    size80 = "int80",
    size88 = "int88",
    size96 = "int96",
    size104 = "int104",
    size112 = "int112",
    size120 = "int120",
    size128 = "int128",
    size136 = "int136",
    size144 = "int144",
    size152 = "int152",
    size160 = "int160",
    size168 = "int168",
    size176 = "int176",
    size184 = "int184",
    size192 = "int192",
    size200 = "int200",
    size208 = "int208",
    size216 = "int216",
    size224 = "int224",
    size232 = "int232",
    size240 = "int240",
    size248 = "int248",
    size256 = "int256"
}

export type NumberTypes = Uints | Ints;

export const NumberTypeStrings = Object.values(Uints).concat(Object.values(Ints));

export type ParamValue = boolean | string

type MethodParams = { [name:string] : ParamValue }

export type MethodState = {
    params : MethodParams
    error : string[] | string | null
    result? : any
}

export type AllMethodState = { [name:string] : MethodState }

export type SetParamPayload = {
    fieldName: string
    value: ParamValue
}

export type Action = {
    type: string
    payload: any
}

enum OtherSolTypes {
    address = "address",
    bool = "bool",
    string = "string"
}

export type SolidityTypes = Uints | Ints | Bytes | OtherSolTypes;

export type InputMap = { [name:string] : SolidityTypes }