import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function setBondPriceAndMint(name: string, fundingAddress: string, bondDistributionAddress: string, bondPrice: bigint) {
  console.log(`\nSetting bond price and minting for ${name}:`);
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
    const signers = await ethers.getSigners();
    const investors = signers.slice(1, 6); // Get investors at indices 1 to 5

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

async function main() {
  const fundingAddressAlpha = process.env.FUNDING_ADDRESS;
  const bondDistributionAddressAlpha = process.env.BOND_DISTRIBUTION_ADDRESS;
  const fundingAddressBeta = process.env.FUNDING_BETA_ADDRESS;
  const bondDistributionAddressBeta = process.env.BOND_DISTRIBUTION_BETA_ADDRESS;
  const fundingAddressZeta = process.env.FUNDING_ZETA_ADDRESS;
  const bondDistributionAddressZeta = process.env.BOND_DISTRIBUTION_ZETA_ADDRESS;

  if (!fundingAddressAlpha || !bondDistributionAddressAlpha || !fundingAddressBeta || !bondDistributionAddressBeta || !fundingAddressZeta || !bondDistributionAddressZeta) {
    throw new Error("One or more required addresses not set in scripts/.env file");
  }

  const bondPriceAlpha = ethers.parseUnits("75", 6);
  const bondPriceBeta = ethers.parseUnits("85", 6);
  const bondPriceZeta = ethers.parseUnits("90", 6);

  await setBondPriceAndMint("Alpha", fundingAddressAlpha, bondDistributionAddressAlpha, bondPriceAlpha);
  await setBondPriceAndMint("Beta", fundingAddressBeta, bondDistributionAddressBeta, bondPriceBeta);
  await setBondPriceAndMint("Zeta", fundingAddressZeta, bondDistributionAddressZeta, bondPriceZeta);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
