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

  const signers = await ethers.getSigners();
  const owner = signers[0];
  const investors = signers.slice(1, 11); // Get 10 investors

  const targetAmount = await funding.targetAmount();
  console.log("Target Amount:", ethers.formatUnits(targetAmount, 6), "USDC");

  let currentTotalInvested = await mockUSDC.balanceOf(fundingAddress);
  console.log("Current Total Invested:", ethers.formatUnits(currentTotalInvested, 6), "USDC");

  let remainingAmount = targetAmount - currentTotalInvested;
  console.log("Remaining Amount to Invest:", ethers.formatUnits(remainingAmount, 6), "USDC");

  const ownerUSDCBalance = await mockUSDC.balanceOf(owner.address);
  console.log("Owner USDC Balance:", ethers.formatUnits(ownerUSDCBalance, 6), "USDC");

  console.log("\nMaking investments...");

  let investorIndex = 0;
  while (remainingAmount > 0) {
    const investor = investors[investorIndex % investors.length];
    const amountToInvest = ethers.parseUnits(Math.min(100000, Number(ethers.formatUnits(remainingAmount, 6))).toString(), 6);

    try {
      console.log(`\nProcessing investment for ${investor.address}`);
      
      console.log("Transferring USDC to investor...");
      await mockUSDC.connect(owner).transfer(investor.address, amountToInvest);
      
      const investorBalance = await mockUSDC.balanceOf(investor.address);
      console.log(`Investor USDC balance: ${ethers.formatUnits(investorBalance, 6)} USDC`);

      console.log("Approving USDC for Funding contract...");
      await mockUSDC.connect(investor).approve(fundingAddress, amountToInvest);
      
      const allowance = await mockUSDC.allowance(investor.address, fundingAddress);
      console.log(`Allowance for Funding contract: ${ethers.formatUnits(allowance, 6)} USDC`);

      console.log("Investing in Funding contract...");
      const investTx = await funding.connect(investor).invest(amountToInvest);
      await investTx.wait();

      console.log(`Investment successful: ${ethers.formatUnits(amountToInvest, 6)} USDC`);

      currentTotalInvested = await mockUSDC.balanceOf(fundingAddress);
      remainingAmount = targetAmount - currentTotalInvested;
      console.log(`Total invested: ${ethers.formatUnits(currentTotalInvested, 6)} USDC`);
      console.log(`Remaining to invest: ${ethers.formatUnits(remainingAmount, 6)} USDC`);

      const distributionReady = await bondDistribution.distributionReady();
      console.log("Distribution ready:", distributionReady);

    } catch (error: any) {
      console.error(`Error during investment for ${investor.address}:`, error.message);
      if (error.data) {
        console.error("Error data:", error.data);
      }
    }

    investorIndex++;
  }

  console.log("\nTarget amount reached. Checking final investment amounts:");

  for (const investor of investors) {
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

  for (const investor of investors) {
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
