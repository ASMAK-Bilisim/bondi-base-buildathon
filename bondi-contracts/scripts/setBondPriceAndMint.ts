import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const fundingAddress = process.env.FUNDING_ADDRESS;
  const bondDistributionAddress = process.env.BOND_DISTRIBUTION_ADDRESS;

  if (!fundingAddress || !bondDistributionAddress) {
    throw new Error("FUNDING_ADDRESS or BOND_DISTRIBUTION_ADDRESS not set in .env file");
  }

  console.log("Funding address:", fundingAddress);
  console.log("BondDistribution address:", bondDistributionAddress);

  try {
    const funding = await ethers.getContractAt("Funding", fundingAddress);
    const bondDistribution = await ethers.getContractAt("BondDistribution", bondDistributionAddress);

    console.log("Contracts attached successfully");

    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);

    // Attempt to set bond price and initiate minting
    console.log("Attempting to set bond price and initiate minting...");
    const bondPrice = ethers.parseUnits("70", 6); // real purchase price
    
    try {
      const tx = await funding.connect(deployer).setBondPriceAndInitiateMinting(bondPrice);
      await tx.wait();
      console.log("Bond price set to:", ethers.formatUnits(bondPrice, 6), "USDC per BT and minting initiated");
    } catch (error: any) {
      console.error("Error setting bond price and initiating minting:", error.message);
      return;
    }

    // Check if bond price is set
    const bondPriceSet = await funding.bondPriceSet();
    console.log("Bond price set:", bondPriceSet);

    // Check if distribution is ready
    const distributionReady = await bondDistribution.distributionReady();
    console.log("Distribution ready:", distributionReady);

    // Check claimable tokens for each investor
    const [, investor1, investor2, investor3, investor4, investor5] = await ethers.getSigners();
    const investors = [investor1, investor2, investor3, investor4, investor5];

    for (let i = 0; i < investors.length; i++) {
      const investor = investors[i];
      const claimableTokens = await bondDistribution.getClaimableTokens(investor.address);
      console.log(`Investor ${i + 1} (${investor.address}) claimable tokens:`, ethers.formatUnits(claimableTokens, 18));
    }
  } catch (error: any) {
    console.error("Error:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
