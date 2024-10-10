import { ethers } from "hardhat";

async function main() {
  const fundingAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const mockUSDCAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const bondDistributionAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"; // Add this line

  const funding = await ethers.getContractAt("Funding", fundingAddress);
  const mockUSDC = await ethers.getContractAt("MockUSDC", mockUSDCAddress);
  const bondDistribution = await ethers.getContractAt("BondDistribution", bondDistributionAddress);

  const [owner, investor1, investor2, investor3, investor4, investor5] = await ethers.getSigners();

  const targetAmount = await funding.targetAmount();
  console.log("Target Amount:", ethers.formatUnits(targetAmount, 6), "USDC");

  const investments = [
    { investor: investor1, amount: ethers.parseUnits("4000", 6) },
    { investor: investor2, amount: ethers.parseUnits("4500", 6) },
    { investor: investor3, amount: ethers.parseUnits("25000", 6) },
    { investor: investor4, amount: ethers.parseUnits("30000", 6) },
    { investor: investor5, amount: ethers.parseUnits("36500", 6) },
  ];

  console.log("\nMaking investments...");

  for (const { investor, amount } of investments) {
    // Approve USDC spending
    await mockUSDC.connect(owner).transfer(investor.address, amount);
    await mockUSDC.connect(investor).approve(fundingAddress, amount);

    // Make investment
    await funding.connect(investor).invest(amount);

    console.log(`Investor ${investor.address} invested ${ethers.formatUnits(amount, 6)} USDC`);

    const totalInvested = await mockUSDC.balanceOf(fundingAddress);
    console.log(`Total invested: ${ethers.formatUnits(totalInvested, 6)} USDC`);

    const bondDistribution = await ethers.getContractAt("BondDistribution", bondDistributionAddress);
    const distributionReady = await bondDistribution.distributionReady();
    console.log("Distribution ready:", distributionReady);

    if (distributionReady) {
      console.log("Bond token minting has been initiated!");
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