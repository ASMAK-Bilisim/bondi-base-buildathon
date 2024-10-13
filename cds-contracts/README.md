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
