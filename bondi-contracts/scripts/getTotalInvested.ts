import { ethers } from "hardhat";

async function main() {
  const fundingAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const usdcAddress = process.env.USDC_TOKEN_ADDRESS;

  console.log("USDC Address:", usdcAddress);

  const Funding = await ethers.getContractAt("Funding", fundingAddress);
  console.log("Funding contract loaded");

  try {
    const USDC = await ethers.getContractAt("MockUSDC", usdcAddress);
    console.log("MockUSDC contract loaded");

    const balance = await USDC.balanceOf(fundingAddress);
    console.log(`Total invested: ${ethers.formatUnits(balance, 6)} USDC`);

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