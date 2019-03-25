# abi2reducks
An easy way to convert your smart contract's ABI into reducks modules hooked up to a Redux store.

It expects to be called within an empty directory (e.g. `state`) and will set it up as such:

```
--| /state // Your parent directory, name is arbitrary
----| /reusable
------| actions.ts
------| reducers.ts
------| selectors.ts
------| types.ts
------| util.ts
----| /txDucks
------| /[methodName1] // Each method gets its own duck
--------| actions.ts
--------| index.ts
--------| reducers.ts
--------| selectors.ts
--------| types.ts
------| /[methodName2]
------| /...
----| Contract.ts // Generated web3 interface for your ABI
----| index.ts // Exports store
----| store.ts // Properly configured store
```

## CLI Usage
As a command line utility, install globally and then call the command with the path to an ABI JSON, its deployed address, and a web3 HTTP Provider URL.

```
$ npm i -g @eximchain/abi2reducks
$ ...
$ abi2reducks --help
$
$ abi2reducks path/to/abi.json 0x00...002a https://gamma-tx-executor-us-east.eximchain-dev.com
```

## Library Usage
As a library, you import the class, create an instance with the two arguments, and then call `generate()`.  The generator class is the module's default export.

```
$ npm i @eximchain/abi2reducks

...

// Import with types
import ReducksGenerator from '@eximchain/abi2reducks'

// Create generator
const duckGen = new ReducksGenerator({
    abi : [array of MethodAbi objects],
    address: [string Ethereum address],
    web3URL: [string HTTPProvider URL]
})

// Create /ducks/... in your cwd()
duckGen.generate()
```