import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import BondDistributionABI from "../artifacts/contracts/BondDistribution.sol/BondDistribution.json";

dotenv.config();

async function main() {
  const bondDistributionAddress = process.env.BOND_DISTRIBUTION_ADDRESS;

  if (!bondDistributionAddress) {
    throw new Error("BOND_DISTRIBUTION_ADDRESS not set in .env file");
  }

  const [signer] = await ethers.getSigners();
  const bondDistribution = new ethers.Contract(bondDistributionAddress, BondDistributionABI.abi, signer);

  const bondPrice = await bondDistribution.bondPrice();
  console.log("Bond Price:", ethers.formatUnits(bondPrice, 6), "USDC");

  const distributionReady = await bondDistribution.distributionReady();
  console.log("Distribution Ready:", distributionReady);

  const totalBondTokens = await bondDistribution.totalBondTokens();
  console.log("Total Bond Tokens:", ethers.formatUnits(totalBondTokens, 18), "BT");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
