# Bondi Smart Contracts Project

## Basic Commands

To get the list of tasks you can run in this Hardhat project, run:
```shell
npx hardhat help
```

To start the local development node, run:
```shell
npx hardhat node
```

## Deployment

Remember that to interact with already deployed contracts, it is recommended to store the deployed addresses as environment variables (under the names defined below) to make sure the correct addresses are passed to the contracts.

### Funding

Deploying the Funding contract requires specifying the following parameters before deployment:
- `minimumInvestmentAmount`: The minimum investment amount in WEI (1 USDC Token = 1e18 WEI).
- `targetAmount`: The investment target amount to be reached, in WEI (1 USDC Token = 1e18 WEI).
- `fundingPeriodLimitInDays`: The duration of the funding period, expressed in days.
- `usdcTokenAddress`: The address of the ERC-20 token that will fund the contract.

These parameters should be set in the `ignition/parameters.json` file. If the file doesn't exist, the parameters will be fetched from the `.env` variables `MINIMUM_INVESTMENT_AMOUNT`, `TARGET_AMOUNT`, `FUNDING_PERIOD_LIMIT_DAYS`, and `USDC_TOKEN_ADDRESS`.

To deploy the Funding contract, run:
```shell
npx hardhat ignition deploy ./ignition/modules/Funding.ts --network [aNetworkToDeploy] --parameters ignition/parameters.json
```

### InvestorNFT

Deploying the InvestorNFT contract requires specifying the following parameters before deployment:
- `tokenName`: The name of the token (string).
- `tokenSymbol`: The symbol of the token (string).
- `minter`: The address of the contract's minter.

These parameters should be set in the `ignition/parameters.json` file. If the file doesn't exist, the parameters will be fetched from the `.env` variables `INVESTORNFT_TOKEN_NAME`, `INVESTORNFT_TOKEN_SYMBOL`, and `INVESTORNFT_MINTER`.

To deploy the InvestorNFT contract, run:
```shell
npx hardhat ignition deploy ./ignition/modules/InvestorNFT.ts --network [aNetworkToDeploy] --parameters ignition/parameters.json
```

## Contract Interaction

To interact with any of the deployed contracts, the following tasks are available:

### Funding

- **invest**: This task allows for investing in a deployed Funding contract using a USDC Token contract. You can either provide the contracts' addresses directly in the task command or they will be automatically fetched from the `.env` variables `FUNDING_CONTRACT` and `USDC_TOKEN_CONTRACT`.
  
- **getTargetAmount**: This task retrieves the target amount set for a deployed Funding contract. You can either provide the contract's address directly or it will be fetched from the `.env` variable `FUNDING_CONTRACT`.

- **getInvestedAmount**: This task retrieves an investor's current invested amount from a deployed Funding contract. You can either provide the contract's address directly or it will be fetched from the `.env` variable `FUNDING_CONTRACT`. The investor's address must always be passed as a parameter.

- **incrementFundingPeriodLimit**: This task allows for extending the funding period of a deployed Funding contract. You can either provide the contract's address or it will be fetched from the `.env` variable `FUNDING_CONTRACT`. The number of days to extend the funding period can be passed via the `daystoincrement` parameter or fetched from the `.env` variable `FUNDING_PERIOD_LIMIT_DAYS`.

- **setMinimumInvestmentAmount**: This task sets a minimum investment amount for a deployed Funding contract. You can either provide the contract's address or it will be fetched from the `.env` variable `FUNDING_CONTRACT`. The minimum investment amount (in USDC) can be passed via the `minimuminvestment` parameter or fetched from the `.env` variable `FUNDING_MINIMUM_INVESTMENT`.

- **setTargetAmount**: This task sets the target amount for a deployed Funding contract. You can either provide the contract's address or it will be fetched from the `.env` variable `FUNDING_CONTRACT`. The target amount (in USDC) can be passed via the `targetamount` parameter or fetched from the `.env` variable `FUNDING_TARGET_AMOUNT`.

To use any of these tasks, run:
```shell
npx hardhat [nameOfTheTask] [--parameterName parameter] --network [aNetworkToInteractWith]
```

### InvestorNFT

- **setBaseUri**: This task sets the base URI for a deployed InvestorNFT contract. You can either provide the contract's address and base URI string directly in the task command or they will be fetched from the `.env` variables `INVESTORNFT_CONTRACT` and `INVESTORNFT_BASE_URI`.

- **getTokenUri**: This task retrieves the token URI for a given token ID from a deployed InvestorNFT contract. You can either provide the contract's address or it will be fetched from the `.env` variable `INVESTORNFT_CONTRACT`. The token ID must always be passed as a parameter.

To use any of these tasks, run:
```shell
npx hardhat [nameOfTheTask] [--parameterName parameter] --network [aNetworkToInteractWith]
```

## Testing

To run unit tests, use the following command:
```shell
npx hardhat test
```

To run tests with gas reporting enabled, use:
```shell
REPORT_GAS=true npx hardhat test
```

## Security

To install the eth-security-toolbox, run:
```shell
docker pull trailofbits/eth-security-toolbox
```

Run the Docker container:
```shell
docker run -it -v "$PWD":/code trailofbits/eth-security-toolbox
cd /code
```

To run **Slither** static testing, use:
```shell
slither .
```

To run **Echidna** fuzz testing, use:
```shell
echidna ./ --contract [aFuzzContract] --test-mode assertion
``` 