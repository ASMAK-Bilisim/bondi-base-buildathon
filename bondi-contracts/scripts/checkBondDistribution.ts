import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import path from "path";
import BondDistributionABI from "../artifacts/contracts/BondDistribution.sol/BondDistribution.json";

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function checkBondDistribution(name: string, bondDistributionAddress: string) {
  console.log(`\nChecking ${name} Bond Distribution:`);
  const [signer] = await ethers.getSigners();
  const bondDistribution = new ethers.Contract(bondDistributionAddress, BondDistributionABI.abi, signer);

  const bondPrice = await bondDistribution.bondPrice();
  console.log("Bond Price:", ethers.formatUnits(bondPrice, 6), "USDC");

  const distributionReady = await bondDistribution.distributionReady();
  console.log("Distribution Ready:", distributionReady);

  const totalBondTokens = await bondDistribution.totalBondTokens();
  console.log("Total Bond Tokens:", ethers.formatUnits(totalBondTokens, 18), "BT");
}

async function main() {
  const bondDistributionAddressAlpha = process.env.BOND_DISTRIBUTION_ADDRESS;
  const bondDistributionAddressBeta = process.env.BOND_DISTRIBUTION_BETA_ADDRESS;
  const bondDistributionAddressZeta = process.env.BOND_DISTRIBUTION_ZETA_ADDRESS;

  if (!bondDistributionAddressAlpha || !bondDistributionAddressBeta || !bondDistributionAddressZeta) {
    throw new Error("One or more BOND_DISTRIBUTION_ADDRESS not set in scripts/.env file");
  }

  await checkBondDistribution("Alpha", bondDistributionAddressAlpha);
  await checkBondDistribution("Beta", bondDistributionAddressBeta);
  await checkBondDistribution("Zeta", bondDistributionAddressZeta);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
