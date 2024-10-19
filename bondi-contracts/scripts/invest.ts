import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function investInFunding(name: string, fundingAddress: string, mockUSDCAddress: string, bondDistributionAddress: string) {
  console.log(`\nInvesting in ${name} Funding contract:`);
  const funding = await ethers.getContractAt("Funding", fundingAddress);
  const mockUSDC = await ethers.getContractAt("MockUSDC", mockUSDCAddress);
  const bondDistribution = await ethers.getContractAt("BondDistribution", bondDistributionAddress);

  const signers = await ethers.getSigners();
  const owner = signers[0];
  const investors = signers.slice(1, 6); // Get investors at indices 1 to 5

  const targetAmount = await funding.targetAmount();
  console.log("Target Amount:", ethers.formatUnits(targetAmount, 6), "USDC");

  const currentTotalInvested = await mockUSDC.balanceOf(fundingAddress);
  console.log("Current Total Invested:", ethers.formatUnits(currentTotalInvested, 6), "USDC");

  const remainingAmount = targetAmount - currentTotalInvested;
  console.log("Remaining Amount to Invest:", ethers.formatUnits(remainingAmount, 6), "USDC");

  const investments = [
    { investor: investors[0], amount: ethers.parseUnits("1000", 6) },
    { investor: investors[1], amount: ethers.parseUnits("1000", 6) },
    { investor: investors[2], amount: ethers.parseUnits("1000", 6) },
    { investor: investors[3], amount: ethers.parseUnits("5000", 6) },
    { investor: investors[4], amount: ethers.parseUnits("1500", 6) },
  ];

  console.log("\nMaking investments...");

  for (const { investor, amount } of investments) {
    try {
      console.log(`\nProcessing investment for ${investor.address}`);
      
      console.log("Transferring USDC to investor...");
      await mockUSDC.connect(owner).transfer(investor.address, amount);
      
      console.log("Approving USDC for Funding contract...");
      await mockUSDC.connect(investor).approve(fundingAddress, amount);
      
      console.log("Investing in Funding contract...");
      const investTx = await funding.connect(investor).invest(amount);
      await investTx.wait();

      console.log(`Investment successful: ${ethers.formatUnits(amount, 6)} USDC`);

      const distributionReady = await bondDistribution.distributionReady();
      console.log("Distribution ready:", distributionReady);

    } catch (error: any) {
      console.error(`Error during investment for ${investor.address}:`, error.message);
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
}

async function main() {
  const mockUSDCAddress = process.env.USDC_TOKEN_ADDRESS;
  const fundingAddressAlpha = process.env.FUNDING_ADDRESS;
  const fundingAddressBeta = process.env.FUNDING_BETA_ADDRESS;
  const fundingAddressZeta = process.env.FUNDING_ZETA_ADDRESS;
  const bondDistributionAddressAlpha = process.env.BOND_DISTRIBUTION_ADDRESS;
  const bondDistributionAddressBeta = process.env.BOND_DISTRIBUTION_BETA_ADDRESS;
  const bondDistributionAddressZeta = process.env.BOND_DISTRIBUTION_ZETA_ADDRESS;

  if (!mockUSDCAddress || !fundingAddressAlpha || !fundingAddressBeta || !fundingAddressZeta ||
      !bondDistributionAddressAlpha || !bondDistributionAddressBeta || !bondDistributionAddressZeta) {
    throw new Error("One or more required addresses not set in scripts/.env file");
  }

  await investInFunding("Alpha", fundingAddressAlpha, mockUSDCAddress, bondDistributionAddressAlpha);
  await investInFunding("Beta", fundingAddressBeta, mockUSDCAddress, bondDistributionAddressBeta);
  await investInFunding("Zeta", fundingAddressZeta, mockUSDCAddress, bondDistributionAddressZeta);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
