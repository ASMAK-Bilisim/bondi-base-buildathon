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
  const investors = signers.slice(1, 6); // Get investors at indices 1, 2, 3, 4, 5

  /*
  console.log("Sending 0.001 ETH to each investor...");
  for (const investor of investors) {
    const tx = await owner.sendTransaction({
      to: investor.address,
      value: ethers.parseEther("0.001")
    });
    await tx.wait();
    console.log(`Sent 0.001 ETH to ${investor.address}`);
  }
  */

  const targetAmount = await funding.targetAmount();
  console.log("Target Amount:", ethers.formatUnits(targetAmount, 6), "USDC");

  const currentTotalInvested = await mockUSDC.balanceOf(fundingAddress);
  console.log("Current Total Invested:", ethers.formatUnits(currentTotalInvested, 6), "USDC");

  const remainingAmount = targetAmount - currentTotalInvested;
  console.log("Remaining Amount to Invest:", ethers.formatUnits(remainingAmount, 6), "USDC");

  const ownerUSDCBalance = await mockUSDC.balanceOf(owner.address);
  console.log("Owner USDC Balance:", ethers.formatUnits(ownerUSDCBalance, 6), "USDC");

  const investments = [
    { investor: investors[0], amount: ethers.parseUnits("4000", 6) },
    { investor: investors[1], amount: ethers.parseUnits("4500", 6) },
    { investor: investors[2], amount: ethers.parseUnits("60000", 6) },
    { investor: investors[3], amount: ethers.parseUnits("65000", 6) },
    { investor: investors[4], amount: ethers.parseUnits("66500", 6) },
  ];

  console.log("\nMaking investments...");

  let totalNewInvestments = 0n;

  for (const { investor, amount } of investments) {
    try {
      console.log(`\nProcessing investment for ${investor.address}`);
      
      console.log("Transferring USDC to investor...");
      await mockUSDC.connect(owner).transfer(investor.address, amount);
      
      const investorBalance = await mockUSDC.balanceOf(investor.address);
      console.log(`Investor USDC balance: ${ethers.formatUnits(investorBalance, 6)} USDC`);

      console.log("Approving USDC for Funding contract...");
      await mockUSDC.connect(investor).approve(fundingAddress, amount);
      
      const allowance = await mockUSDC.allowance(investor.address, fundingAddress);
      console.log(`Allowance for Funding contract: ${ethers.formatUnits(allowance, 6)} USDC`);

      console.log("Investing in Funding contract...");
      const investTx = await funding.connect(investor).invest(amount);
      await investTx.wait();

      console.log(`Investment successful: ${ethers.formatUnits(amount, 6)} USDC`);
      totalNewInvestments += amount;

      console.log(`Total new investments: ${ethers.formatUnits(totalNewInvestments, 6)} USDC`);

      const distributionReady = await bondDistribution.distributionReady();
      console.log("Distribution ready:", distributionReady);

      if (totalNewInvestments >= remainingAmount) {
        console.log("Target amount reached. Stopping investments.");
        break;
      }
    } catch (error: any) {
      console.error(`Error during investment for ${investor.address}:`, error.message);
      if (error.data) {
        console.error("Error data:", error.data);
      }
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
