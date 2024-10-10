import { ethers } from "hardhat";

async function main() {
  const fundingAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const bondDistributionAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const bondTokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const funding = await ethers.getContractAt("Funding", fundingAddress);
  const bondDistribution = await ethers.getContractAt("BondDistribution", bondDistributionAddress);
  const bondToken = await ethers.getContractAt("BondToken", bondTokenAddress);

  const [, investor1, investor2, investor3, investor4, investor5] = await ethers.getSigners();
  const investors = [investor1, investor2, investor3, investor4, investor5];

  console.log("Claiming Bond Tokens for investors...");

  for (let i = 0; i < investors.length; i++) {
    const investor = investors[i];
    
    console.log(`\nInvestor ${i + 1} (${investor.address}):`);
    
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
  }

  console.log("\nAll investors have claimed their bond tokens.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});