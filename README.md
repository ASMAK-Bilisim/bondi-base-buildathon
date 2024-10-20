# Bondi Base Buildathon

## Introduction

Bondi Finance is revolutionizing the bond market by leveraging blockchain technology to tokenize corporate bonds and create an accessible bond insurance (Credit Default Swap, or CDS) market. Our platform empowers investors to seamlessly participate in bond offerings and trade bond-related insurance in a decentralized and transparent manner.

In this Base Buildathon project, we have:

- Implemented smart wallet integration.
- Developed a CDS market from scratch.
- Assigned base names to each bond using ENS basenames.
- Introduced a loyalty program with NFTs.

### Bonds and Bond Insurance (CDS)

A **bond** is a fixed-income instrument representing a loan made by an investor to a borrower. Bonds are used by companies and governments to finance projects and operations. **Bond insurance**, or **Credit Default Swap (CDS)**, is a financial derivative allowing an investor to offset their credit risk with that of another investor. Essentially, the buyer of a CDS receives credit protection, while the seller guarantees the creditworthiness of the debt security.

Our loyalty program rewards participants with unique NFTs, providing benefits tied to their involvement in the Bondi ecosystem.

## Access and Functionality

We have deployed three websites on Vercel and assigned our secondary domain to interact with the functionalities mentioned above. Our smart contracts are deployed on the Base Sepolia network.

### Deployed Websites

1. **Bondi Web3 Application**: [democratize.bond](https://democratize.bond)
2. **Token Claiming Interface**: [claim.democratize.bond](https://claim.democratize.bond)
3. **Minting Interface**: [minter.democratize.bond](https://minter.democratize.bond)

### How to Interact with Our Application

#### Step 1: Claim Mock Tokens

- Navigate to [claim.democratize.bond](https://claim.democratize.bond).
- If you're not on Base Sepolia or don't have it configured in your wallet, click on **"Switch to / Add Base Sepolia Network"** to add and switch to it.
- Enter your wallet address and click on **"Claim Tokens"**. This will provide you with **10,000 Mock USDC** and some Base Sepolia ETH for gas.

#### Step 2: Interact with the Bondi Web3 Application

- Go to [democratize.bond](https://democratize.bond).
- You should see your USDC balance and can interact with our web application.
- If you don't see the USDC in your wallet, click on **"Add Mock USDC to Wallet"** on [claim.democratize.bond](https://claim.democratize.bond) or manually add the token using the address: `0xD0CE0FF07Dc2ca1AB1109C4cFC0fBb3741013911`.

#### Step 3: Complete KYC Process

- On [democratize.bond](https://democratize.bond), you need to complete a simple KYC to interact with the platform.
- Provide your nationality, document type, and upload any dummy file.
- **Note**: This is a dummy process; we do not store these files and automatically accept your KYC.

### Main Features

#### 1. Primary Market

- View bond token offerings, check specifics, and choose bonds to invest in.
- Bond offerings start in the **Payment Pending** phase until the target amount is reached.
- Once the target is met, the offering moves to **Awaiting Real-Life Purchase** phase.
- To simulate the real-life purchase and minting:

  - Go to [minter.democratize.bond](https://minter.democratize.bond).
  - Enter the provided private key (this represents the deployer wallet or Bondi Authority).
  - After assuming the role of Bondi Authority:

    1. Choose the funding contract.
    2. Click on **"Mint Bond Tokens"**.
    3. Set the real-life purchase price.
    4. Click on **"Set Bond Price and Initiate Minting"**.

  - Return to [democratize.bond](https://democratize.bond); the offering should now be in the **Minting Ready** phase.
  - Users can now **mint (claim)** their bond tokens from the distribution contract.

#### 2. Insurance Market (CDS Market)

- Access the CDS market for each bond token from the primary market.
- Our CDS market currently operates as a one-sided order book:

  - **Sellers** set the premium (annualized percentage return) they're willing to accept for selling CDS.
  - **Buyers** can view all offers and purchase the best existing offer.

- The CDS market can be expanded into a synthetic CDS market for any existing bond, making it a fully decentralized product with zero real-world interaction.
- **Note**: The decision process for CDS (whether a bond has defaulted) is not implemented in the front-end but exists in the smart contract in a basic form.

#### 3. Coupon Page

- Once users mint their bond tokens, they can view the coupons they will collect over the bond's lifecycle.
- The nominal amount of coupons is determined by:

  - The investment amount (set by the user).
  - The real-life purchase price information (set by Bondi Authority).

## Local Running Information

### Subdirectory: bondi-contracts

All deployed contracts are located in `bondi-contracts/contracts`:

- `BondDistribution.sol`
- `BondToken.sol`
- `Funding.sol`
- `InvestorNFT.sol`
- `MockUSDC.sol`

#### Basic Commands

To start the local development node, run:

```bash
npx hardhat node
``` 

## Cache and Deployment Cleanup

To clean the cache and deployment artifacts:

```bash
npx hardhat clean
rm -rf ignition/deployments
```

This is necessary to deploy multiple funding contracts with the same ignition script `Funding.ts`.

### Deployment

To deploy for real, you need to set the `.env` file. The current deployment is configured for **Base Sepolia**, so if you want to deploy elsewhere, configure the `hardhat.config.ts` file accordingly.

The complete global `.env` file should have the following environment variables:

```plaintext
MNEMONIC=
INFURA_KEY=
MINIMUM_INVESTMENT_AMOUNT=
TARGET_AMOUNT=
FUNDING_PERIOD_LIMIT_DAYS=
USDC_TOKEN_ADDRESS=
INVESTORNFT_OG_TOKEN_NAME=
INVESTORNFT_OG_TOKEN_SYMBOL=
OG_NFT_ADDRESS=
INVESTORNFT_WHALE_TOKEN_NAME=
INVESTORNFT_WHALE_TOKEN_SYMBOL=
WHALE_NFT_ADDRESS=
BOND_TOKEN_NAME=
BOND_TOKEN_SYMBOL=
OG_NFT_BASE_URI=
WHALE_NFT_BASE_URI=
```

Not all these variables are set from the beginning; some will be filled after deploying certain contracts and will be used in subsequent deployments. Update them as you deploy more contracts.

The environment variables you need to have **before running any script** are:

```plaintext
MNEMONIC=
INFURA_KEY=
MINIMUM_INVESTMENT_AMOUNT=
TARGET_AMOUNT=
FUNDING_PERIOD_LIMIT_DAYS=
INVESTORNFT_OG_TOKEN_NAME=
INVESTORNFT_OG_TOKEN_SYMBOL=
INVESTORNFT_WHALE_TOKEN_NAME=
INVESTORNFT_WHALE_TOKEN_SYMBOL=
OG_NFT_BASE_URI=
WHALE_NFT_BASE_URI=
```

The environment variables you will be adding **as you deploy the smart contracts** are:

```plaintext
USDC_TOKEN_ADDRESS=
OG_NFT_ADDRESS=
WHALE_NFT_ADDRESS=
```

The environment variables you need to **keep changing** as you're deploying new funding, bond token, and bond distribution contracts:

```plaintext
BOND_TOKEN_NAME=
BOND_TOKEN_SYMBOL=
```

#### Deployment Sequence

1. **Deploy Mock USDC**

   ```bash
   npx hardhat ignition deploy ./ignition/modules/DeployMockUsdc.ts --network baseSepolia
   ```

   Take the deployed address and add it to the `.env` file:

   ```plaintext
   USDC_TOKEN_ADDRESS=
   ```

2. **Deploy the First Funding Contract**

   ```bash
   npx hardhat ignition deploy ./ignition/modules/FundingWithMintables.ts --network baseSepolia
   ```

   This script will deploy one funding contract, bond token, bond distribution contract, and two NFT contracts. It will also assign the `MINTER_ROLE` in the NFT contracts to the deployed funding contract. These NFT contracts will be used for all other funding contracts. Add the deployed `InvestorNFT` contract addresses to the `.env` file:

   ```plaintext
   OG_NFT_ADDRESS=
   WHALE_NFT_ADDRESS=
   ```

3. **Deploy Additional Funding Contracts**

   For each funding contract you want to deploy, change the `.env` variables accordingly:

   ```plaintext
   BOND_TOKEN_NAME=
   BOND_TOKEN_SYMBOL=
   ```

   Then deploy:

   ```bash
   npx hardhat ignition deploy ./ignition/modules/Funding.ts --network baseSepolia
   ```

   You might need to clean the cache and deployment artifacts before each deployment. An `id.json` file is provided at `bondi-contracts/ignition/modules/utils` for better tracking at each deployment.

   Additionally, note that contracts can be deployed with mock parameters by adding at the end of the deployment script:

   ```bash
   --parameters ignition/parameters.json
   ```

### Contract Interactions

There are two types of files to interact with the contracts:

1. **Tasks in `bondi-contracts/scripts/tasks`**

   To run these:

   ```bash
   npx hardhat [taskName] [--parameterName parameter] --network baseSepolia
   ```

   Note that you need to add the tasks to the `hardhat.base.config.tasks` file.

2. **Scripts in `bondi-contracts/scripts`**

   Run:

   ```bash
   npx hardhat run scripts/[scriptName] --network baseSepolia
   ```

   These scripts use the `.env` file at `bondi-contracts/.env`. Your `.env` should look something like this to run these scripts:

   ```plaintext
   OG_NFT_ADDRESS=
   WHALE_NFT_ADDRESS=
   USDC_TOKEN_ADDRESS=

   # Bond Token Alpha
   BOND_TOKEN_ADDRESS=
   FUNDING_ADDRESS=
   BOND_DISTRIBUTION_ADDRESS=

   # Bond Token Beta
   BOND_TOKEN_BETA_ADDRESS=
   FUNDING_BETA_ADDRESS=
   BOND_DISTRIBUTION_BETA_ADDRESS=

   # Bond Token Zeta
   BOND_TOKEN_ZETA_ADDRESS=
   FUNDING_ZETA_ADDRESS=
   BOND_DISTRIBUTION_ZETA_ADDRESS=
   ```

### Testing

To run unit tests, use the following command:

```bash
npx hardhat test
```

### Security

To install the **eth-security-toolbox**, run:

```bash
docker pull trailofbits/eth-security-toolbox
```

Run the Docker container:

```bash
docker run -it -v "$PWD":/code trailofbits/eth-security-toolbox
cd /code
```

To run **Slither** static analysis, use:

```bash
slither .
```

To run **Echidna** fuzz testing, use:

```bash
echidna ./ --contract [aFuzzContract] --test-mode assertion
```

## Subdirectory: cds-contracts

Please refer to the existing README in the `cds-contracts` subdirectory for detailed instructions.

## Subdirectory: bondi-app

### Basic Commands

Install the dependencies:

```bash
npm install
```

### Deployment Setup

You need a `.env` file to deploy locally. These are provided to Vercel for our current deployment:

```plaintext
VITE_THIRDWEB_CLIENT_ID=
NEXT_PUBLIC_THIRDWEB_SECRET_KEY=
```

You will also need to create a `.npmrc` file to use the icon set we utilize. You won't be able to deploy without this. Create the `.npmrc` file in the root directory (`bondi-app/`). Add the following inside:

```plaintext
//registry.npmjs.org/:_authToken=[YOUR_AUTH_TOKEN]
```

Replace `[YOUR_AUTH_TOKEN]` with your actual NPM authentication token.

**Note**: This file must be created before installing dependencies on Vercel.

### Deployment

Run:

```bash
npm run dev
```

## Subdirectory: claim-mock-usdc

### Basic Commands

Install the dependencies:

```bash
npm install
```

### Deployment Setup

You need a `.env` file to deploy locally. These are provided to Vercel for our current deployment:

```plaintext
VITE_FAUCET_PRIVATE_KEY=
VITE_MOCK_USDC_ADDRESS=
VITE_BASE_SEPOLIA_CHAIN_ID=
```

The wallet specified by `VITE_FAUCET_PRIVATE_KEY` calls the necessary functions on `MockUSDC.sol` for the address provided by the user in the input field.

### Deployment

Run:

```bash
npm run dev
```

## Subdirectory: admin-bondtoken-minting

### Basic Commands

Install the dependencies:

```bash
npm install
```

### Deployment Setup

You need a `.env` file to deploy locally. These are provided to Vercel for our current deployment:

```plaintext
VITE_ADMIN_PRIVATE_KEY=
VITE_ALPHA_FUNDING_CONTRACT=
VITE_BETA_FUNDING_CONTRACT=
VITE_ZETA_FUNDING_CONTRACT=
VITE_BASE_SEPOLIA_RPC=
VITE_BASE_SEPOLIA_CHAIN_ID=
```

These variables must be filled with:

- The private key of the deployer of the smart contracts.
- The addresses of the deployed funding contracts to be manipulated.
- Network configuration variables.

### Deployment

Run:

```bash
npm run dev
```

## Subdirectory: base-namer

Please refer to the existing README in the `base-namer` subdirectory for detailed instructions.

## Future Integration and Improvements

### General Improvements

- **Real-Life Oracle Integration**: Fetch real-world bond prices.
- **Yield-Bearing Stablecoin Derivatives**: Integrate as collateral for the CDS market.
- **Limit Orders for CDS Buyers**: Implement limit order functionality.
- **Capital Efficiency**: Route funds collected in funding contracts to a lending market like Aave.
- **Coupon and Principal Repayment Vaults**: Create dedicated vaults.
- **Full KYC Integration**: Including on-chain verification.

### Base-Specific Improvements

- **On-Chain Reputation**: Use Base's reputation system to decrease collateral needed to issue CDS.
- **Basename Usage**: For vault, contract, and coupon naming.
- **Multi-Currency Acceptance**:
  - Accept all major cryptocurrencies for BT and CDS funding.
  - Convert them to USDC or yield-bearing stablecoin derivatives like aUSDT (Aave USDT).
  - Accept Coinbase balance directly.

## Authority Specifications

### List Authority

- **Responsibilities**:
  - Approves bonds to be offered in the funding phase.
  - Approves crucial information about the bonds.
  - Can modify parameters in the funding phase smart contracts.
- **Vision**: Transfer this role to **Bondi DAO** to perform tasks via on-chain voting.

### Withdraw Authority

- **Responsibilities**:
  - Approves withdrawing of funds to an offramp provider or the custodian/broker.
  - Can approve this transaction only if the target amount is reached within the funding period.
- **Vision**: Transfer this role to a **multisig wallet** involving:
  - Custodian/Broker
  - Auditing Firm
  - Consultant
  - Key Members of the Crypto Community
  - Bondi DAO

### Mint Authority

- **Responsibilities**:
  - Approves the minting information of the bonds after the realized purchase information is provided by the custodian/broker.
  - Approves the minting of BTs to the Minting Smart Contract from where users will manually claim their share of BT.
- **Control**: Initially under **Bondi Finance Inc.**





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


   