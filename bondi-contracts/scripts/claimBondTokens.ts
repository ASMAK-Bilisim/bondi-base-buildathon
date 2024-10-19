import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function claimBondTokens(name: string, fundingAddress: string, bondDistributionAddress: string, bondTokenAddress: string) {
  console.log(`\nClaiming Bond Tokens for ${name} investors:`);

  const funding = await ethers.getContractAt("Funding", fundingAddress);
  const bondDistribution = await ethers.getContractAt("BondDistribution", bondDistributionAddress);
  const bondToken = await ethers.getContractAt("BondToken", bondTokenAddress);

  const signers = await ethers.getSigners();
  const investors = signers.slice(1, 6); // Get investors at indices 1 to 5

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
}

async function main() {
  const fundingAddressAlpha = process.env.FUNDING_ADDRESS;
  const bondDistributionAddressAlpha = process.env.BOND_DISTRIBUTION_ADDRESS;
  const bondTokenAddressAlpha = process.env.BOND_TOKEN_ADDRESS;
  const fundingAddressBeta = process.env.FUNDING_BETA_ADDRESS;
  const bondDistributionAddressBeta = process.env.BOND_DISTRIBUTION_BETA_ADDRESS;
  const bondTokenAddressBeta = process.env.BOND_TOKEN_BETA_ADDRESS;
  const fundingAddressZeta = process.env.FUNDING_ZETA_ADDRESS;
  const bondDistributionAddressZeta = process.env.BOND_DISTRIBUTION_ZETA_ADDRESS;
  const bondTokenAddressZeta = process.env.BOND_TOKEN_ZETA_ADDRESS;

  if (!fundingAddressAlpha || !bondDistributionAddressAlpha || !bondTokenAddressAlpha ||
      !fundingAddressBeta || !bondDistributionAddressBeta || !bondTokenAddressBeta ||
      !fundingAddressZeta || !bondDistributionAddressZeta || !bondTokenAddressZeta) {
    throw new Error("One or more required addresses not set in scripts/.env file");
  }

  await claimBondTokens("Alpha", fundingAddressAlpha, bondDistributionAddressAlpha, bondTokenAddressAlpha);
  await claimBondTokens("Beta", fundingAddressBeta, bondDistributionAddressBeta, bondTokenAddressBeta);
  await claimBondTokens("Zeta", fundingAddressZeta, bondDistributionAddressZeta, bondTokenAddressZeta);

  console.log("\nAll investors have attempted to claim their bond tokens for all three contracts.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
