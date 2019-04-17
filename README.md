# abi-clerk-lambda

> Lambda function for the ABI Clerk.

## How to Build
To deploy a Lambda function, it must be wrapped into a zip file with all of its dependencies.  You can produce this zip file with:

```sh
npm run build
```

This will produce an `abi-clerk-lambda.zip` at the package root directory.  The command is idempotent -- if you run it again while a build already exists, it won't package that old build into the new build.

## Endpoints
- **`/create`**
  - Accepts a body with the following keys:
    - **`DappName`**: Unique name for your dapp, will be in the domain.
    - **`OwnerEmail`**: Email address of the dapp's owner.  Will receive completion notification.
    - **`Abi`**: An ABI method array as an escaped JSON string.
    - **`ContractAddr`**: The deployed address of your chosen contract.
    - **`Web3URL`**: The URL for your HTTPProvider.  Our transaction executors work for Eximchain dapps, Infura would work for Ethereum dapps.  Include `https://`
    - **`GuardianURL`**: The URL of your Guardian instance.  Include `https://`
  - Spins up all associated infrastructure and returns a success.
- **`/read`**
  - Accepts a body with key `DappName`.
  - Returns the dapp's corresponding DynamoDB object.
- **`/delete`**
  - Accepts a body with key `DappName`.
  - Destroys all associated resources and returns a success.