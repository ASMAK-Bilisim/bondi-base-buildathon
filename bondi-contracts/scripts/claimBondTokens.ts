import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const fundingAddress = process.env.FUNDING_ADDRESS;
  const bondDistributionAddress = process.env.BOND_DISTRIBUTION_ADDRESS;
  const bondTokenAddress = process.env.BOND_TOKEN_ADDRESS;

  if (!fundingAddress || !bondDistributionAddress || !bondTokenAddress) {
    throw new Error("Please set all required addresses in the .env file");
  }

  const funding = await ethers.getContractAt("Funding", fundingAddress);
  const bondDistribution = await ethers.getContractAt("BondDistribution", bondDistributionAddress);
  const bondToken = await ethers.getContractAt("BondToken", bondTokenAddress);

  console.log("Claiming Bond Tokens for investors...");

  const signers = await ethers.getSigners();
  const investors = signers.slice(1, 11); // Get investors at indices 1 to 10

  for (let i = 0; i < investors.length; i++) {
    const investor = investors[i];
    
    console.log(`\nInvestor ${i + 1} (Index ${i + 1}) (${investor.address}):`);
    
    try {
      const claimableTokensBefore = await bondDistribution.getClaimableTokens(investor.address);
      console.log(`  Claimable tokens before: ${ethers.formatUnits(claimableTokensBefore, 18)} BT`);

      const bondBalanceBefore = await bondToken.balanceOf(investor.address);
      console.log(`  Bond token balance before: ${ethers.formatUnits(bondBalanceBefore, 18)} BT`);

      // Claim bond tokens
      await bondDistribution.connect(investor).claimBondTokens();
      console.log("  Claimed bond tokens");

      const claimableTokensAfter = await bondDistribution.getClaimableTokens(investor.address);
      console.log(`  Claimable tokens after: ${ethers.formatUnits(claimableTokensAfter, 18)} BT`);

      const bondBalanceAfter = await bondToken.balanceOf(investor.address);
      console.log(`  Bond token balance after: ${ethers.formatUnits(bondBalanceAfter, 18)} BT`);
    } catch (error: any) {
      console.error(`  Error for investor ${i + 1}:`, error.message);
    }
  }

  console.log("\nAll investors have attempted to claim their bond tokens.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
