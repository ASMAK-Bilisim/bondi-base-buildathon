import { ethers } from "hardhat";

async function main() {
  const fundingAddress = process.env.FUNDING_ADDRESS;
  const mockUSDCAddress = process.env.USDC_TOKEN_ADDRESS;
  const bondDistributionAddress = process.env.BOND_DISTRIBUTION_ADDRESS;

  if (!fundingAddress || !mockUSDCAddress || !bondDistributionAddress) {
    throw new Error("Please set all required addresses in the .env file");
  }

  const funding = await ethers.getContractAt("Funding", fundingAddress);
  const mockUSDC = await ethers.getContractAt("MockUSDC", mockUSDCAddress);
  const bondDistribution = await ethers.getContractAt("BondDistribution", bondDistributionAddress);

  const [owner, investor1, investor2, investor3, investor4, investor5] = await ethers.getSigners();

  const targetAmount = await funding.targetAmount();
  console.log("Target Amount:", ethers.formatUnits(targetAmount, 6), "USDC");

  const currentTotalInvested = await mockUSDC.balanceOf(fundingAddress);
  console.log("Current Total Invested:", ethers.formatUnits(currentTotalInvested, 6), "USDC");

  const remainingAmount = targetAmount - currentTotalInvested;
  console.log("Remaining Amount to Invest:", ethers.formatUnits(remainingAmount, 6), "USDC");

  const investments = [
    { investor: investor1, amount: ethers.parseUnits("4000", 6) },
    { investor: investor2, amount: ethers.parseUnits("4500", 6) },
    { investor: investor3, amount: ethers.parseUnits("60000", 6) },
    { investor: investor4, amount: ethers.parseUnits("65000", 6) },
    { investor: investor5, amount: ethers.parseUnits("66500", 6) },
  ];

  console.log("\nMaking investments...");

  let totalNewInvestments = 0n;

  for (const { investor, amount } of investments) {
    if (totalNewInvestments + amount > remainingAmount) {
      const adjustedAmount = remainingAmount - totalNewInvestments;
      if (adjustedAmount <= 0n) {
        console.log(`Skipping investment from ${investor.address} as target amount is reached`);
        continue;
      }
      console.log(`Adjusting investment amount for ${investor.address} to ${ethers.formatUnits(adjustedAmount, 6)} USDC`);
      await mockUSDC.connect(owner).transfer(investor.address, adjustedAmount);
      await mockUSDC.connect(investor).approve(fundingAddress, adjustedAmount);
      await funding.connect(investor).invest(adjustedAmount);
      totalNewInvestments += adjustedAmount;
    } else {
      await mockUSDC.connect(owner).transfer(investor.address, amount);
      await mockUSDC.connect(investor).approve(fundingAddress, amount);
      await funding.connect(investor).invest(amount);
      totalNewInvestments += amount;
    }

    console.log(`Investor ${investor.address} invested ${ethers.formatUnits(amount, 6)} USDC`);
    console.log(`Total new investments: ${ethers.formatUnits(totalNewInvestments, 6)} USDC`);

    const distributionReady = await bondDistribution.distributionReady();
    console.log("Distribution ready:", distributionReady);

    if (totalNewInvestments >= remainingAmount) {
      console.log("Target amount reached. Stopping investments.");
      break;
    }
  }

  console.log("\nChecking final investment amounts:");

  for (const { investor } of investments) {
    const investedAmount = await funding.investedAmountPerInvestor(investor.address);
    console.log(`Investor ${investor.address} has invested ${ethers.formatUnits(investedAmount.investedAmount, 6)} USDC`);
  }

  const finalTotalInvested = await mockUSDC.balanceOf(fundingAddress);
  console.log(`\nFinal Total invested: ${ethers.formatUnits(finalTotalInvested, 6)} USDC`);

  const investorCount = await funding.getInvestorAmount();
  console.log(`Total number of investors: ${investorCount.toString()}`);

  // Check NFT balances
  console.log("\nChecking NFT balances:");
  const ogNFTAddress = await funding.ogNFT();
  const whaleNFTAddress = await funding.whaleNFT();
  const ogNFT = await ethers.getContractAt("InvestorNFT", ogNFTAddress);
  const whaleNFT = await ethers.getContractAt("InvestorNFT", whaleNFTAddress);

  for (const { investor } of investments) {
    const ogBalance = await ogNFT.balanceOf(investor.address);
    const whaleBalance = await whaleNFT.balanceOf(investor.address);
    console.log(`Investor ${investor.address}:`);
    console.log(`  OG NFT Balance: ${ogBalance.toString()}`);
    console.log(`  Whale NFT Balance: ${whaleBalance.toString()}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});