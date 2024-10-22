# Bondi Base Buildathon

## Introduction

Bondi Finance is revolutionizing the bond market by leveraging blockchain technology to tokenize corporate bonds, making traditionally inaccessible markets more open and transparent. We empower investors to seamlessly participate in our bond token ecosystem.

Also, our loyalty program rewards participants with unique NFTs that entitle holders to upcoming Bondi protocol token allocation.

In this Base Buildathon project, we focused on creating an accessible bond insurance market, developing a **Credit Default Swap (CDS)** mechanism that can be made fully synthetic, eliminating the need for real-life bond purchases. Additionally, a decentralized court system can be integrated for dispute resolution, as outlined in the **Authority Specifications** below. Other advanced features include:

- **Coinbase Smart Wallet** integration to simplify user interaction with blockchain technology, making it accessible for both experienced and novice users.
- A CDS market built from scratch.
- Base names assigned to each bond using **ENS basenames**, promoting transparency and trust by ensuring retail investor safety in a compliant market.

## Bonds and Bond Insurance (CDS)

A **bond** is a fixed-income instrument representing a loan made by an investor to a borrower. Bonds are used by companies and governments to finance projects and operations. **Bond insurance**, or **Credit Default Swap (CDS)**, is a financial derivative that allows an investor to offset their credit risk with that of another investor. Essentially, the buyer of a CDS receives credit protection, while the seller guarantees the creditworthiness of the debt security.

## Directory Structure

Our main repository for the buildathon is named `bondi-base-buildathon`, and it contains the following subdirectories:

- `admin-bondtoken-minting`
- `bondi-app`
- `bondi-contracts`
- `cds-contracts`
- `claim-mock-usdc`
- `base-namer`
Each subdirectory focuses on different functionalities of the project.

## Access and Functionality

We have deployed three websites on Vercel, with subdomains of our secondary domain pointing to each site to enable the functionalities outlined in this project. Our smart contracts are live on the Base Sepolia network.

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

- Displays the funding phase for each bond token offering.
- View bond token offerings, check specifics, and choose bonds to invest in.
- Bond offerings start in the **Payment** phase until the target amount is reached.
- Once the target is met, the offering moves to the **Purchase** phase.
- After real-life bonds are purchased, the offering moves to the **Minting** phase, where bond tokens are minted to investors.

##### Simulating Real-Life Purchase and Minting:

1. Go to [minter.democratize.bond](https://minter.democratize.bond).
2. Enter the provided private key (this represents the deployer wallet or Bondi Authority).
3. After assuming the role of Bondi Authority:

   - Choose the funding contract.
   - Click on **"Mint Bond Tokens"**.
   - Set the real-life purchase price.
   - Click on **"Set Bond Price and Initiate Minting"**.
4. Return to [democratize.bond](https://democratize.bond); the offering should now be in the **Minting** phase.
5. Users can now **mint (claim)** their bond tokens from the distribution contract.

#### 2. Insurance Market (CDS Market)

- Access the CDS market for each bond token from the primary market.
- The CDS market operates as a one-sided order book:

   - **Sellers** set the premium (annualized percentage return) they’re willing to accept for selling CDS.
   - **Buyers** can view all offers and purchase the best existing offer.

- The CDS market can be expanded into a synthetic CDS market for any existing bond, making it a fully decentralized product with zero real-world interaction.
- **Note**: The decision process for CDS (whether a bond has defaulted) is not implemented in the front-end but exists in the smart contract in a basic form.

#### 3. Coupon Page

- Once users mint their bond tokens, they can view the coupons they will collect over the bond’s lifecycle.
- The nominal amount of coupons is determined by:

   - The investment amount (set by the user).
   - The real-life purchase price information (set by Bondi Authority).

# Local Running Information for Each Subdirectory

## bondi-contracts

All deployed contracts are located in `bondi-contracts/contracts`:

- `BondDistribution.sol`
- `BondToken.sol`
- `Funding.sol`
- `InvestorNFT.sol`
- `MockUSDC.sol`

### Basic Commands

To start the local development node, run:

```bash
npx hardhat node
``` 

### Cache and Deployment Cleanup

To clean the cache and deployment artifacts:

```bash
npx hardhat clean
rm -rf ignition/deployments
```

This is necessary to deploy multiple funding contracts with the same ignition script `Funding.ts`.

### Deployment

To deploy in a live environment, you need to set the `.env` file. The current deployment is configured for **Base Sepolia**, so if you want to deploy elsewhere, configure the `hardhat.config.ts` file accordingly.

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

### Deployment Sequence

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

   This script will deploy one funding contract, bond token, bond distribution contract, and two NFT contracts. 
   It will also assign the `MINTER_ROLE` in the NFT contracts to the deployed funding contract. These NFT contracts will be used for all other funding contracts. Add the deployed `InvestorNFT` contract addresses to the `.env` file:

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

  After deployment, you need to assing MINTER_ROLE to the funding contract:

   ```bash
   npx hardhat setMinterRole --minter [theAddressOfTheNewFundingContract] --contract [theAddressOfEachOfTheNFTContracts]
   ```

   Additionally, note that contracts can be deployed with mock parameters by adding at the end of the deployment script:

   ```bash
   --parameters ignition/parameters.json
   ```

When deploying the contracts using `Funding.ts` and `FundingWithMintables.ts`, both scripts will first deploy the funding contract and the NFT contracts. Next, the bond token contract will be deployed with the specified bond token name and symbol. Afterward, the scripts will deploy the bond distribution contract and assign the `FUNDING_CONTRACT_ROLE` to the funding contract during this deployment. Following this, the `addMinter` function will be called on the bond token contract to assign the `MINTER_ROLE` to the bond distribution contract. Finally, the newly deployed bond distribution contract will be set to the state variable `bondDistribution` in the funding contract.

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

## cds-contracts

### Basic Commands

Install the required dependencies:

```bash
forge install
```

Install specific dependencies without committing changes:

```bash
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge install foundry-rs/forge-std --no-commit
forge install smartcontractkit/chainlink --no-commit
```

### Deployment Setup

You need a `.env` file to run the deployment script.
```plaintext
DEPLOYER_PRIVATE_KEY=
ADMIN_ADDRESS=
```


For local deployment:

1. Start a local Anvil instance:

```bash
anvil -f wss://base-sepolia-rpc.publicnode.com -b 1
```

2. Run the deployment script locally:

```bash
forge script script/CDSManager.s.sol --rpc-url 127.0.0.1:8545 --broadcast
```

For deployment to Base Sepolia network:

```bash
forge script script/CDSManager.s.sol --rpc-url wss://base-sepolia-rpc.publicnode.com --broadcast
```

### Testing

Run the test suite:

```bash
forge test
```

### Deployed Addresses

- CDSManagerAddress: `0x8EF3641e4246EC26c7Ef10c8256bdc332f89B251`

Bond Hashes:
- Bond Hash 0: `0x0265c651436ffc2bf316776ba3e9574d01d3d1c651c59059dab7dc22a4e891c3`
- Bond Hash 1: `0xa29ce4538e275a93c7c2421b6222f2f034d9b7e487808551519112e060f8ef0a`
- Bond Hash 2: `0xcecde1728274de089ac3991a0d71061962be8bd1a0f6100b9578873f31f967da`

## bondi-app

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

### Deployment

Run:

```bash
npm run dev
```

## claim-mock-usdc

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

## admin-bondtoken-minting

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
## base-namer
### Basic Commands

Install the dependencies:

```Bash
npm install
```
### Deployment Setup
You need a .env file to deploy locally. Create a .env file in the base-namer directory with the following variables:
```
BASE_NAME=
PRIVATE_KEY=
```
Fill these variables with:
- The desired base name for your bonds.
- The private key of the wallet that will perform the naming transactions.


To run the base namer script:

```Bash

node src/index.js
```
### Addresses with Corresponding Transactions and Basenames:
```
1. Address:  
   0x01Cf7c1C65A66f65A38893e831a3107EE842Ce81  
   Transaction:  
   0x30ec9c4ead7d5e600f65c1202cf0224bdc62392702e9af41b8fd66401417de75  
   Basename:  
   alphabondzz.basetest.eth
```
```
2. Address:  
   0x093A98F9fAeA01c73a51F978714a638708FFa90f  
   Transaction:  
   0x5acee8116c7c49f835e91479d0803a2c24c7295856a0f2d33448c6196a3ec2b6  
   Basename:  
   betabondzz.basetest.eth
```
```
3. Address:  
   0xe48B71132F2E8df6De19C13Ed1D68b52D82f094A  
   Transaction:  
   0x8a83244a5742dcae0ad21ec583a5ae1b1dd034784cfc1ca653e67951456a7d23  
   Basename:  
   zetabondzz.basetest.eth
```
# Future Integration and Improvements

## General Improvements

- **Real-Life Oracle Integration**: Fetch real-world bond prices.
- **Yield-Bearing Stablecoin Derivatives**: Integrate as collateral for the CDS market.
- **Limit Orders for CDS Buyers**: Implement limit order functionality.
- **Capital Efficiency**: Route funds collected in funding contracts to a lending market like Aave.
- **Coupon and Principal Repayment Vaults**: Create dedicated vaults.
- **Full KYC Integration**: Including onchain verification.
- **Capital Efficiency Improvmeent**: Letting the creator deposit just the next coupon + principal – premium.

## Base-Specific Improvements

- **Onchain Reputation**: Use Base's reputation system to decrease collateral needed to issue CDS.
- **Basename Usage**: For vault, contract, and coupon naming.
- **Multi-Currency Acceptance**:
  - Accept all major cryptocurrencies for BT and CDS funding.
  - Convert them to USDC or yield-bearing stablecoin derivatives like aUSDT (Aave USDT).
  - Accept Coinbase balance directly.

# Authority Specifications

Currently, the deployer (identified by the wallet using the private key on [minter.democratize.bond](https://minter.democratize.bond)) holds multiple roles, including `PAUSER_ROLE` and `FREEZER_ROLE` on the bond token contract. However, the long-term vision is to separate these functions and roles across different authorities, each governed by multi-signature (multisig) structures that serve distinct purposes.

## List Authority

- **Responsibilities**:
  - Approves bonds to be offered in the funding phase.
  - Approves crucial information about the bonds.
  - Can modify parameters in the funding phase smart contracts.

- **Vision**: Transfer this role to **Bondi DAO** to perform tasks via onchain voting.

## Withdraw Authority

- **Responsibilities**:
  - Approves the withdrawal of funds to an offramp provider or the custodian/broker.
  - Can approve this transaction only if the target amount is reached within the funding period.

- **Vision**: Transfer this role to a **multisig wallet** involving:
  - Custodian/Broker
  - Auditing Firm
  - Consultant
  - Key Members of the Crypto Community
  - Bondi DAO

## Mint Authority

- **Responsibilities**:
  - Approves the minting information of the bonds after the realized purchase information is provided by the custodian/broker.
  - Approves the minting of BTs to the Minting Smart Contract, from which users will manually claim their share of BT.

- **Control**: Initially under **Bondi Finance Inc.**

## CDS Decision Authority

- **Responsibilities**:
  - Makes the final decision on whether the bond issuer has defaulted, impacting the CDS market.

- **Vision**: A decentralized court system, such as **Kleros**, will be integrated in the future to have the final say on whether the bond issuer has defaulted. This will enable the CDS market to become fully decentralized.


