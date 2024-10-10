import { ethers } from "hardhat";
import { formatUnits } from "@ethersproject/units";

async function main() {
  // Contract addresses
  const fundingAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const mockUSDCAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const bondTokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const bondDistributionAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const whaleNFTAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
  const ogNFTAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

  // Get contract instances
  const funding = await ethers.getContractAt("Funding", fundingAddress);
  const mockUSDC = await ethers.getContractAt("MockUSDC", mockUSDCAddress);
  const bondToken = await ethers.getContractAt("BondToken", bondTokenAddress);
  const bondDistribution = await ethers.getContractAt("BondDistribution", bondDistributionAddress);
  const whaleNFT = await ethers.getContractAt("InvestorNFT", whaleNFTAddress);
  const ogNFT = await ethers.getContractAt("InvestorNFT", ogNFTAddress);

  console.log("Checking all contracts...\n");

  // Check Funding contract
  console.log("Funding Contract:");
  const minimumInvestmentAmount = await funding.minimumInvestmentAmount();
  console.log("- Minimum Investment Amount:", formatUnits(minimumInvestmentAmount, 6));
  const targetAmount = await funding.targetAmount();
  console.log("- Target Amount:", formatUnits(targetAmount, 6));
  const fundingPeriodLimit = await funding.fundingPeriodLimit();
  console.log("- Funding Period Limit:", new Date(Number(fundingPeriodLimit) * 1000).toLocaleString());
  const investorCount = await funding.getInvestorAmount();
  console.log("- Current Investor Count:", investorCount.toString());

  // Check MockUSDC contract
  console.log("\nMockUSDC Contract:");
  const usdcName = await mockUSDC.name();
  const usdcSymbol = await mockUSDC.symbol();
  const usdcDecimals = await mockUSDC.decimals();
  const usdcTotalSupply = await mockUSDC.totalSupply();
  console.log("- Name:", usdcName);
  console.log("- Symbol:", usdcSymbol);
  console.log("- Decimals:", usdcDecimals);
  console.log("- Total Supply:", formatUnits(usdcTotalSupply, usdcDecimals));

  // Check BondToken contract
  console.log("\nBondToken Contract:");
  const bondName = await bondToken.name();
  const bondSymbol = await bondToken.symbol();
  const bondDecimals = await bondToken.decimals();
  const bondTotalSupply = await bondToken.totalSupply();
  console.log("- Name:", bondName);
  console.log("- Symbol:", bondSymbol);
  console.log("- Decimals:", bondDecimals);
  console.log("- Total Supply:", formatUnits(bondTotalSupply, bondDecimals));

  // Check BondDistribution contract
  console.log("\nBondDistribution Contract:");
  const bondPrice = await bondDistribution.bondPrice();
  const distributionReady = await bondDistribution.distributionReady();
  console.log("- Bond Price:", bondPrice > 0 ? formatUnits(bondPrice, 6) : "Not set");
  console.log("- Distribution Ready:", distributionReady);

  // Check WhaleNFT contract
  console.log("\nWhale NFT Contract:");
  const whaleNFTName = await whaleNFT.name();
  const whaleNFTSymbol = await whaleNFT.symbol();
  console.log("- Name:", whaleNFTName);
  console.log("- Symbol:", whaleNFTSymbol);

  // Check OGNFT contract
  console.log("\nOG NFT Contract:");
  const ogNFTName = await ogNFT.name();
  const ogNFTSymbol = await ogNFT.symbol();
  console.log("- Name:", ogNFTName);
  console.log("- Symbol:", ogNFTSymbol);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});