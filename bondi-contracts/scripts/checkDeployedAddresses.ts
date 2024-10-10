import { ethers } from "hardhat";

async function main() {
  const DeployMockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await DeployMockUSDC.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

  const Funding = await ethers.getContractFactory("Funding");
  const funding = await Funding.attach("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");

  const BondDistribution = await ethers.getContractFactory("BondDistribution");
  const bondDistribution = await BondDistribution.attach("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9");

  console.log("Checking deployed contracts...");
  console.log("MockUSDC address:", await mockUSDC.getAddress());
  console.log("Funding address:", await funding.getAddress());
  console.log("BondDistribution address:", await bondDistribution.getAddress());

  try {
    // Remove the line trying to access _minimumInvestmentAmount
    
    const bondPriceSet = await funding.bondPriceSet();
    console.log("Bond price set:", bondPriceSet);
    
    const bondDistributionAddress = await funding.bondDistribution();
    console.log("BondDistribution address from Funding contract:", bondDistributionAddress);
  } catch (error) {
    console.error("Error calling Funding contract:", error.message);
  }

  try {
    const bondPrice = await bondDistribution.bondPrice();
    console.log("Current bond price:", ethers.formatUnits(bondPrice, 6));
  } catch (error) {
    console.error("Error calling BondDistribution contract:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});