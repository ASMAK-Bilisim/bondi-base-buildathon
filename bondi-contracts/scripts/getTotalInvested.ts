import { ethers } from "hardhat";
import { formatUnits } from "ethers";

async function main() {
  const fundingAddress = process.env.FUNDING_ADDRESS;
  const usdcAddress = process.env.MOCK_USDC_ADDRESS;

  if (!fundingAddress || !usdcAddress) {
    throw new Error("Please set FUNDING_ADDRESS and MOCK_USDC_ADDRESS in the .env file");
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