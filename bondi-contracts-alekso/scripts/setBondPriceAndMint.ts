import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  const fundingAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const bondDistributionAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

  console.log("Funding address:", fundingAddress);
  console.log("BondDistribution address:", bondDistributionAddress);

  const funding = await ethers.getContractAt("Funding", fundingAddress);
  const bondDistribution = await ethers.getContractAt("BondDistribution", bondDistributionAddress);

  console.log("Contracts attached successfully");

  // Check roles
  const DEFAULT_ADMIN_ROLE = await funding.DEFAULT_ADMIN_ROLE();
  console.log("Deployer address:", deployer.address);
  console.log("Has DEFAULT_ADMIN_ROLE:", await funding.hasRole(DEFAULT_ADMIN_ROLE, deployer.address));

  // Set bond price and initiate minting (1 BT = 90 USDC)
  const bondPrice = ethers.parseUnits("90", 6);
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
  const [, investor1, investor2, investor3, investor4, investor5] = await ethers.getSigners();
  const investors = [investor1, investor2, investor3, investor4, investor5];

  for (let i = 0; i < investors.length; i++) {
    const investor = investors[i];
    const claimableTokens = await bondDistribution.getClaimableTokens(investor.address);
    console.log(`Investor ${i + 1} (${investor.address}) claimable tokens:`, ethers.formatUnits(claimableTokens, 18));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});