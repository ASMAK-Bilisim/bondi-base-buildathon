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

    // List of functions to check
    const functions = [
      "usdcToken",
      "targetAmount",
      "whaleNFT",
      "ogNFT",
      "getInvestorAmount",
      "bondPriceSet",
      "bondDistribution"
    ];

    for (const func of functions) {
      try {
        const result = await funding[func]();
        console.log(`${func}:`, result.toString());
      } catch (error: any) {
        console.log(`Error calling ${func}:`, error.message);
      }
    }

    // Try to get investor details
    console.log("\nAttempting to get investor details...");
    const signers = await ethers.getSigners();

    for (let i = 1; i <= 5; i++) {
      const investor = signers[i];
      try {
        const investedAmount = await funding.investedAmountPerInvestor(investor.address);
        console.log(`Investor ${i} (${investor.address}):`);
        console.log(`  Invested Amount: ${ethers.formatUnits(investedAmount.investedAmount, 6)} USDC`);
      } catch (error: any) {
        console.log(`Error getting details for investor ${i}:`, error.message);
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
