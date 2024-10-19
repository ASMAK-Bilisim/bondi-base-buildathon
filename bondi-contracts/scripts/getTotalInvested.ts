import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function checkTotalInvested(name: string, fundingAddress: string, usdcAddress: string) {
  console.log(`\nChecking ${name} total invested:`);
  const funding = await ethers.getContractAt("Funding", fundingAddress);
  const usdc = await ethers.getContractAt("MockUSDC", usdcAddress);

  const balance = await usdc.balanceOf(fundingAddress);
  console.log(`Total invested: ${ethers.formatUnits(balance, 6)} USDC`);

  const investorCount = await funding.getInvestorAmount();
  console.log(`Number of investors: ${investorCount}`);

  // Check individual investor amounts
  const signers = await ethers.getSigners();
  const investors = signers.slice(1, 6); // Get investors at indices 1 to 5

  for (let i = 0; i < investors.length; i++) {
    const investor = investors[i];
    const investedAmount = await funding.investedAmountPerInvestor(investor.address);
    console.log(`Investor ${i + 1} (Index ${i + 1}) (${investor.address}) invested: ${ethers.formatUnits(investedAmount.investedAmount, 6)} USDC`);
  }
}

async function main() {
  const usdcAddress = process.env.USDC_TOKEN_ADDRESS;
  const fundingAddressAlpha = process.env.FUNDING_ADDRESS;
  const fundingAddressBeta = process.env.FUNDING_BETA_ADDRESS;
  const fundingAddressZeta = process.env.FUNDING_ZETA_ADDRESS;

  if (!usdcAddress || !fundingAddressAlpha || !fundingAddressBeta || !fundingAddressZeta) {
    throw new Error("One or more required addresses not set in scripts/.env file");
  }

  await checkTotalInvested("Alpha", fundingAddressAlpha, usdcAddress);
  await checkTotalInvested("Beta", fundingAddressBeta, usdcAddress);
  await checkTotalInvested("Zeta", fundingAddressZeta, usdcAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
