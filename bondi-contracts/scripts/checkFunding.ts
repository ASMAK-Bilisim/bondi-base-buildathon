import { ethers } from "hardhat";

async function main() {
  const fundingAddress = process.env.FUNDING_ADDRESS;
  if (!fundingAddress) {
    throw new Error("FUNDING_ADDRESS not set in .env file");
  }

  console.log("Checking Funding contract at address:", fundingAddress);

  try {
    const funding = await ethers.getContractAt("Funding", fundingAddress);
    
    console.log("Contract ABI loaded successfully");

    // Try to call a simple view function first
    const usdcTokenAddress = await funding.usdcToken();
    console.log("USDC Token Address:", usdcTokenAddress);

    // Now try to call targetAmount
    const targetAmount = await funding.targetAmount();
    console.log("Target Amount:", ethers.formatUnits(targetAmount, 6), "USDC");

    // Remove the line trying to access _minimumInvestmentAmount
    // We'll need to add a getter function in the Funding contract if we want to access this

    // Remove the line trying to access fundingPeriodLimit
    // We'll need to add a getter function in the Funding contract if we want to access this

    const whaleNFTAddress = await funding.whaleNFT();
    console.log("Whale NFT Address:", whaleNFTAddress);

    const ogNFTAddress = await funding.ogNFT();
    console.log("OG NFT Address:", ogNFTAddress);

    const investorCount = await funding.getInvestorAmount();
    console.log("Current Investor Count:", investorCount.toString());

    const bondPriceSet = await funding.bondPriceSet();
    console.log("Bond Price Set:", bondPriceSet);

    const distributionReady = await bondDistribution.distributionReady();
    console.log("Distribution Ready:", distributionReady);

    if (bondPriceSet) {
      const bondPrice = await bondDistribution.bondPrice();
      console.log("Bond Price:", ethers.formatUnits(bondPrice, 6), "USDC per BT");
    }

    console.log("\nInvestor Details:");
    const [, investor1, investor2, investor3, investor4, investor5] = await ethers.getSigners();
    const investors = [investor1, investor2, investor3, investor4, investor5];

    for (let i = 0; i < investors.length; i++) {
      const investor = investors[i];
      const investedAmount = await funding.investedAmountPerInvestor(investor.address);
      console.log(`Investor ${i + 1} (${investor.address}):`);
      console.log(`  Invested Amount: ${ethers.formatUnits(investedAmount.investedAmount, 6)} USDC`);
      
      if (distributionReady) {
        const claimableTokens = await bondDistribution.getClaimableTokens(investor.address);
        console.log(`  Claimable Bond Tokens: ${ethers.formatUnits(claimableTokens, 18)} BT`);
      }
      console.log();
    }
  } catch (error: any) {
    console.error("Error interacting with Funding contract:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});