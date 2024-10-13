import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import FundingABI from "../artifacts/contracts/Funding.sol/Funding.json";
import BondDistributionABI from "../artifacts/contracts/BondDistribution.sol/BondDistribution.json";
import BondTokenABI from "../artifacts/contracts/BondToken.sol/BondToken.json";

dotenv.config();

async function main() {
  const fundingAddress = process.env.FUNDING_ADDRESS;
  const bondDistributionAddress = process.env.BOND_DISTRIBUTION_ADDRESS;
  const bondTokenAddress = process.env.BOND_TOKEN_ADDRESS;

  if (!fundingAddress || !bondDistributionAddress || !bondTokenAddress) {
    throw new Error("Please set FUNDING_ADDRESS, BOND_DISTRIBUTION_ADDRESS, and BOND_TOKEN_ADDRESS in the .env file");
  }

  const [signer] = await ethers.getSigners();

  const funding = new ethers.Contract(fundingAddress, FundingABI.abi, signer);
  const bondDistribution = new ethers.Contract(bondDistributionAddress, BondDistributionABI.abi, signer);
  const bondToken = new ethers.Contract(bondTokenAddress, BondTokenABI.abi, signer);

  console.log("Checking claimable Bond Tokens for investors...");

  const investorCount = await funding.getInvestorAmount();
  console.log(`Total number of investors: ${investorCount}`);

  for (let i = 0; i < investorCount; i++) {
    const investorAddress = await funding.investors(i);
    const investedAmount = await funding.investedAmountPerInvestor(investorAddress);
    const claimableTokens = await bondDistribution.getClaimableTokens(investorAddress);
    
    console.log(`\nInvestor ${i + 1} (${investorAddress}):`);
    console.log(`  Invested Amount: ${ethers.formatUnits(investedAmount.investedAmount, 6)} USDC`);
    console.log(`  Claimable Bond Tokens: ${ethers.formatUnits(claimableTokens, 18)} BT`);

    // Check current BT balance
    const btBalanceBefore = await bondToken.balanceOf(investorAddress);
    console.log(`  Current BT Balance: ${ethers.formatUnits(btBalanceBefore, 18)} BT`);

    // Claim Bond Tokens
    if (claimableTokens > 0n) {
      try {
        const tx = await bondDistribution.connect(signer).claimBondTokens({ from: investorAddress });
        await tx.wait();
        console.log("  Claimed Bond Tokens successfully");

        // Check new BT balance
        const btBalanceAfter = await bondToken.balanceOf(investorAddress);
        console.log(`  New BT Balance: ${ethers.formatUnits(btBalanceAfter, 18)} BT`);
      } catch (error: any) {
        console.error(`  Error claiming Bond Tokens:`, error.message);
      }
    } else {
      console.log("  No Bond Tokens to claim");
    }
  }

  console.log("\nAll investors have been processed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
