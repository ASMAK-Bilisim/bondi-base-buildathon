import { ethers } from "hardhat";

async function main() {
  const fundingAddress = process.env.FUNDING_ADDRESS;
  const mockUSDCAddress = process.env.USDC_TOKEN_ADDRESS;

  if (!fundingAddress || !mockUSDCAddress) {
    throw new Error("Please set all required addresses in the .env file");
  }

  const funding = await ethers.getContractAt("Funding", fundingAddress);
  const mockUSDC = await ethers.getContractAt("MockUSDC", mockUSDCAddress);

  const signers = await ethers.getSigners();
  const owner = signers[0];
  const investors = signers.slice(6, 11); // Get investors at indices 6, 7, 8, 9, 10

  const investments = [
    { investor: investors[0], amount: ethers.parseUnits("40000", 6) },
    { investor: investors[1], amount: ethers.parseUnits("40000", 6) },
    { investor: investors[2], amount: ethers.parseUnits("40000", 6) },
    { investor: investors[3], amount: ethers.parseUnits("40000", 6) },
    { investor: investors[4], amount: ethers.parseUnits("40000", 6) },
  ];

  console.log("\nMaking additional investments...");

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
    } catch (error: any) {
      console.error(`Error during investment for ${investor.address}:`, error.message);
    }
  }

  console.log("\nChecking final investment amounts:");

  for (const { investor } of investments) {
    const investedAmount = await funding.investedAmountPerInvestor(investor.address);
    console.log(`Investor ${investor.address} has invested ${ethers.formatUnits(investedAmount.investedAmount, 6)} USDC`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
