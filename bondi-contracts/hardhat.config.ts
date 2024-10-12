import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    baseSepolia: {
      chainId: 84532,
      url: `https://base-sepolia.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: {
        mnemonic: process.env.MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 30 // This will derive 10 addresses
      }
    }
  },
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true
      }
    }
  },
  ignition: {
    // Add any Ignition-specific configurations here if needed
  },
  gasReporter: {
    enabled: !!process.env.REPORT_GAS
  },
  contractSizer: {
    runOnCompile: false
  }
};

export default config;
