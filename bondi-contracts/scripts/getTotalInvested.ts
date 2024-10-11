import { ethers } from "hardhat";
import { formatUnits } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const fundingAddress = process.env.FUNDING_ADDRESS;
  const usdcAddress = process.env.USDC_TOKEN_ADDRESS;

  console.log("FUNDING_ADDRESS:", fundingAddress);
  console.log("USDC_TOKEN_ADDRESS:", usdcAddress);

  if (!fundingAddress || !usdcAddress) {
    throw new Error("Please set FUNDING_ADDRESS and USDC_TOKEN_ADDRESS in the .env file");
  }

  console.log("USDC Address:", usdcAddress);

  const Funding = await ethers.getContractAt("Funding", fundingAddress);
  console.log("Funding contract loaded");

  try {
    const USDC = await ethers.getContractAt("MockUSDC", usdcAddress);
    console.log("MockUSDC contract loaded");

    const balance = await USDC.balanceOf(fundingAddress);
    console.log(`Total invested: ${formatUnits(balance, 6)} USDC`);

    const investorCount = await Funding.getInvestorAmount();
    console.log(`Number of investors: ${investorCount}`);
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});