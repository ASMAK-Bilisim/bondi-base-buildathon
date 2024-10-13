import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const fundingAddress = process.env.FUNDING_ADDRESS;
  if (!fundingAddress) {
    throw new Error("FUNDING_ADDRESS not set in .env file");
  }

  console.log("Checking Funding contract at address:", fundingAddress);

  try {
    const funding = await ethers.getContractAt("Funding", fundingAddress);
    
    console.log("Contract attached successfully");

    // Check target amount
    const targetAmount = await funding.targetAmount();
    console.log("Target Amount:", ethers.formatUnits(targetAmount, 6), "USDC");

    // Check minimum investment amount
    try {
      const minimumInvestmentAmount = await funding.getMinimumInvestmentAmount();
      console.log("Minimum Investment Amount:", ethers.formatUnits(minimumInvestmentAmount, 6), "USDC");
    } catch (error: any) {
      console.log("Error getting minimum investment amount:", error.message);
    }

    // Check funding period limit
    try {
      const fundingPeriodLimit = await funding.getFundingPeriodLimit();
      const fundingPeriodLimitDate = new Date(Number(fundingPeriodLimit) * 1000);
      console.log("Funding Period Limit:", fundingPeriodLimitDate.toLocaleString());
    } catch (error: any) {
      console.log("Error getting funding period limit:", error.message);
    }

    // Other contract details
    console.log("\nOther contract details:");
    const usdcToken = await funding.usdcToken();
    const whaleNFT = await funding.whaleNFT();
    const ogNFT = await funding.ogNFT();
    const investorCount = await funding.getInvestorAmount();
    const bondPriceSet = await funding.bondPriceSet();
    const bondDistribution = await funding.bondDistribution();

    console.log("USDC Token:", usdcToken);
    console.log("Whale NFT:", whaleNFT);
    console.log("OG NFT:", ogNFT);
    console.log("Investor Count:", investorCount.toString());
    console.log("Bond Price Set:", bondPriceSet);
    console.log("Bond Distribution:", bondDistribution);

    // Try to get investor details
    console.log("\nAttempting to get investor details...");
    const signers = await ethers.getSigners();
    const investors = signers.slice(1, 11); // Get investors at indices 1 to 10

    for (let i = 0; i < investors.length; i++) {
      const investor = investors[i];
      try {
        const investedAmount = await funding.investedAmountPerInvestor(investor.address);
        console.log(`Investor ${i + 1} (Index ${i + 1}) (${investor.address}):`);
        console.log(`  Invested Amount: ${ethers.formatUnits(investedAmount.investedAmount, 6)} USDC`);
      } catch (error: any) {
        console.log(`Error getting details for investor ${i + 1} (Index ${i + 1}):`, error.message);
      }
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
