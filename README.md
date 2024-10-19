# BASE NAMER
For the base namer 

npm install
complete ENV file with your data
change the address depending on the bond that you want to name
inside of baseNamerfolder
node src/index.js 
### Addresses with Corresponding Transactions and Basenames:

1. Address:  
   0x01Cf7c1C65A66f65A38893e831a3107EE842Ce81  
   Transaction:  
   0x30ec9c4ead7d5e600f65c1202cf0224bdc62392702e9af41b8fd66401417de75  
   Basename:  
   alphabondzz.basetest.eth

2. Address:  
   0x093A98F9fAeA01c73a51F978714a638708FFa90f  
   Transaction:  
   0x5acee8116c7c49f835e91479d0803a2c24c7295856a0f2d33448c6196a3ec2b6  
   Basename:  
   betabondzz.basetest.eth

3. Address:  
   0xe48B71132F2E8df6De19C13Ed1D68b52D82f094A  
   Transaction:  
   0x8a83244a5742dcae0ad21ec583a5ae1b1dd034784cfc1ca653e67951456a7d23  
   Basename:  
   zetabondzz.basetest.eth

# CDS CONTRACTS
```markdown
# Project Setup and Deployment Guide

This guide outlines how to install dependencies, deploy contracts, and run tests for the project.

## Installation

To install the required dependencies, run the following commands:

```bash
forge install
```

### Install Specific Dependencies

1. **OpenZeppelin Contracts** (without committing changes):

    ```bash
    forge install OpenZeppelin/openzeppelin-contracts --no-commit
    ```

2. **Foundry Standard Library** (without committing changes):

    ```bash
    forge install foundry-rs/forge-std --no-commit
    ```

3. **Chainlink Contracts** (without committing changes):

    ```bash
    forge install smartcontractkit/chainlink --no-commit
    ```

## Local Deployment

To deploy contracts locally, follow these steps:

1. Start a local Anvil instance with the Base Sepolia RPC and a block interval of 1:

    ```bash
    anvil -f wss://base-sepolia-rpc.publicnode.com -b 1
    ```

2. Run the deployment script locally:

    ```bash
    forge script script/CDSManager.s.sol--rpc-url 127.0.0.1:8545 --broadcast
    ```

## Real Deployment

For deploying contracts to the Base Sepolia network:

```bash
forge script script/CDSManager.s.sol --rpc-url wss://base-sepolia-rpc.publicnode.com --broadcast
```

## Testing

To run the test suite for the project:

```bash
forge test
```
## Addresses
                             == Logs ==  
                         CDSManagerAddress
              0xA68bF7fAB3468504FacAC136Cbb1304fB9ad4e1a
  ******************************************************** 
                             bondHash 0 
   0xed8c7521b9b19ff985353c6d2b80f11d59ed59bdac6c1565aa3b91330c595dbc  
  ********************************************************
                             bondHash 1  
   0x26ace0890fbb7e1d380f89fef2e127f1032cd1f3f8fbe86e7af9ded46181ef75
  ********************************************************  
                             bondHash 2 
   0x2105d649c13c4863e02dd806a0a8525f3b715d0cf352b7b3a365919491b3aadf