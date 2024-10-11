import { ethers } from "hardhat";
import { formatUnits } from "ethers";

async function main() {
  // Replace these with the actual deployed addresses on Base Sepolia
  const fundingAddress = process.env.FUNDING_ADDRESS;
  const mockUSDCAddress = process.env.MOCK_USDC_ADDRESS;
  const bondTokenAddress = process.env.BOND_TOKEN_ADDRESS;
  const bondDistributionAddress = process.env.BOND_DISTRIBUTION_ADDRESS;
  const whaleNFTAddress = process.env.WHALE_NFT_ADDRESS;
  const ogNFTAddress = process.env.OG_NFT_ADDRESS;

  if (!fundingAddress || !mockUSDCAddress || !bondTokenAddress || !bondDistributionAddress || !whaleNFTAddress || !ogNFTAddress) {
    throw new Error("Please set all contract addresses in the .env file");
  }

  // Get contract instances
  const funding = await ethers.getContractAt("Funding", fundingAddress);
  const mockUSDC = await ethers.getContractAt("MockUSDC", mockUSDCAddress);
  const bondToken = await ethers.getContractAt("BondToken", bondTokenAddress);
  const bondDistribution = await ethers.getContractAt("BondDistribution", bondDistributionAddress);
  const whaleNFT = await ethers.getContractAt("InvestorNFT", whaleNFTAddress);
  const ogNFT = await ethers.getContractAt("InvestorNFT", ogNFTAddress);

  console.log("Checking all contracts on Base Sepolia...\n");

  // Check Funding contract
  console.log("Funding Contract:");
  const targetAmount = await funding.targetAmount();
  console.log("- Target Amount:", formatUnits(targetAmount, 6));
  // Comment out the fundingPeriodLimit check if it doesn't exist in the contract
  // const fundingPeriodLimit = await funding.fundingPeriodLimit();
  // console.log("- Funding Period Limit:", new Date(Number(fundingPeriodLimit) * 1000).toLocaleString());
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