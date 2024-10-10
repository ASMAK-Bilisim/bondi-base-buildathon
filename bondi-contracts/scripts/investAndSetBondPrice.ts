import { ethers } from "hardhat";

async function main() {
  const fundingAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const mockUSDCAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const bondDistributionAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

  const funding = await ethers.getContractAt("Funding", fundingAddress);
  const mockUSDC = await ethers.getContractAt("MockUSDC", mockUSDCAddress);
  const bondDistribution = await ethers.getContractAt("BondDistribution", bondDistributionAddress);

  const [owner, investor1, investor2, investor3, investor4] = await ethers.getSigners();

  // Set bond price (e.g., 1 USDC = 1 BT)
  const bondPrice = ethers.parseUnits("1", 6);
  await bondDistribution.setBondPrice(bondPrice);
  console.log("Bond price set to:", ethers.formatUnits(bondPrice, 6), "USDC");

  const targetAmount = await funding.targetAmount();
  console.log("Target Amount:", ethers.formatUnits(targetAmount, 6), "USDC");

  const investments = [
    { investor: investor1, amount: ethers.parseUnits("15", 6) },
    { investor: investor2, amount: ethers.parseUnits("25", 6) },
    { investor: investor3, amount: ethers.parseUnits("40", 6) },
    { investor: investor4, amount: ethers.parseUnits("20", 6) },
  ];

  console.log("\nMaking investments...");

  for (const { investor, amount } of investments) {
    // Approve USDC spending
    await mockUSDC.connect(owner).transfer(investor.address, amount);
    await mockUSDC.connect(investor).approve(fundingAddress, amount);

    // Make investment
    await funding.connect(investor).invest(amount);

    console.log(`Investor ${investor.address} invested ${ethers.formatUnits(amount, 6)} USDC`);
  }

  console.log("\nChecking final investment amounts:");

  for (const { investor } of investments) {
    const investedAmount = await funding.investedAmountPerInvestor(investor.address);
    console.log(`Investor ${investor.address} has invested ${ethers.formatUnits(investedAmount.investedAmount, 6)} USDC`);
  }

  const totalInvested = await mockUSDC.balanceOf(fundingAddress);
  console.log(`\nTotal invested: ${ethers.formatUnits(totalInvested, 6)} USDC`);

  const investorCount = await funding.getInvestorAmount();
  console.log(`Total number of investors: ${investorCount.toString()}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});