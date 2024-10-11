import { ethers } from "hardhat";
import { formatUnits } from "ethers";

async function main() {
  const [deployer, user1, user2, user3, user4] = await ethers.getSigners();

  console.log("Checking derived addresses:");
  console.log("Deployer:", deployer.address);
  console.log("User 1:", user1.address);
  console.log("User 2:", user2.address);
  console.log("User 3:", user3.address);
  console.log("User 4:", user4.address);

  // Replace these with the actual deployed addresses on Base Sepolia
  const mockUSDCAddress = process.env.MOCK_USDC_ADDRESS;
  const fundingAddress = process.env.FUNDING_ADDRESS;
  const bondDistributionAddress = process.env.BOND_DISTRIBUTION_ADDRESS;

  if (!mockUSDCAddress || !fundingAddress || !bondDistributionAddress) {
    throw new Error("Please set the contract addresses in the .env file");
  }

  const mockUSDC = await ethers.getContractAt("MockUSDC", mockUSDCAddress);
  const funding = await ethers.getContractAt("Funding", fundingAddress);
  const bondDistribution = await ethers.getContractAt("BondDistribution", bondDistributionAddress);

  console.log("\nChecking deployed contracts on Base Sepolia...");
  console.log("MockUSDC address:", await mockUSDC.getAddress());
  console.log("Funding address:", await funding.getAddress());
  console.log("BondDistribution address:", await bondDistribution.getAddress());

  try {
    const targetAmount = await funding.targetAmount();
    console.log("Target Amount:", formatUnits(targetAmount, 6));
    
    const bondPriceSet = await funding.bondPriceSet();
    console.log("Bond price set:", bondPriceSet);
    
    const bondDistributionAddressFromFunding = await funding.bondDistribution();
    console.log("BondDistribution address from Funding contract:", bondDistributionAddressFromFunding);
  } catch (error: any) {
    console.error("Error calling Funding contract:", error.message);
  }

  try {
    const bondPrice = await bondDistribution.bondPrice();
    console.log("Current bond price:", formatUnits(bondPrice, 6));
  } catch (error: any) {
    console.error("Error calling BondDistribution contract:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});