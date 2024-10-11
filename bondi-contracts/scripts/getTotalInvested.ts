import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const fundingAddress = process.env.FUNDING_ADDRESS;
  const usdcAddress = process.env.USDC_TOKEN_ADDRESS;

  if (!fundingAddress || !usdcAddress) {
    throw new Error("Please set FUNDING_ADDRESS and USDC_TOKEN_ADDRESS in the .env file");
  }

  console.log("FUNDING_ADDRESS:", fundingAddress);
  console.log("USDC_TOKEN_ADDRESS:", usdcAddress);

  try {
    const funding = await ethers.getContractAt("Funding", fundingAddress);
    const usdc = await ethers.getContractAt("MockUSDC", usdcAddress);

    console.log("Contracts loaded successfully");

    const balance = await usdc.balanceOf(fundingAddress);
    console.log(`Total invested: ${ethers.formatUnits(balance, 6)} USDC`);

    const investorCount = await funding.getInvestorAmount();
    console.log(`Number of investors: ${investorCount}`);

    // Check individual investor amounts
    const signers = await ethers.getSigners();

    for (let i = 1; i <= 5; i++) {
      const investor = signers[i];
      const investedAmount = await funding.investedAmountPerInvestor(investor.address);
      console.log(`Investor ${i} (${investor.address}) invested: ${ethers.formatUnits(investedAmount.investedAmount, 6)} USDC`);
    }
  } catch (error: any) {
    console.error("Error occurred:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
