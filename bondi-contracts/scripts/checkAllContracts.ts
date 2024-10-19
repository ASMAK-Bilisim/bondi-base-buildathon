import { ethers } from "hardhat";
import { formatUnits } from "ethers";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function checkContracts(
  name: string,
  fundingAddress: string,
  bondTokenAddress: string,
  bondDistributionAddress: string
) {
  console.log(`\nChecking ${name} contracts:`);

  const funding = await ethers.getContractAt("Funding", fundingAddress);
  const bondToken = await ethers.getContractAt("BondToken", bondTokenAddress);
  const bondDistribution = await ethers.getContractAt("BondDistribution", bondDistributionAddress);

  // Check Funding contract
  console.log("Funding Contract:");
  const targetAmount = await funding.targetAmount();
  console.log("- Target Amount:", formatUnits(targetAmount, 6));
  const investorCount = await funding.getInvestorAmount();
  console.log("- Current Investor Count:", investorCount.toString());

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
}

async function main() {
  const mockUSDCAddress = process.env.USDC_TOKEN_ADDRESS;
  const whaleNFTAddress = process.env.WHALE_NFT_ADDRESS;
  const ogNFTAddress = process.env.OG_NFT_ADDRESS;

  if (!mockUSDCAddress || !whaleNFTAddress || !ogNFTAddress) {
    throw new Error("Please set all common contract addresses in the .env file");
  }

  // Check MockUSDC contract
  console.log("\nMockUSDC Contract:");
  const mockUSDC = await ethers.getContractAt("MockUSDC", mockUSDCAddress);
  const usdcName = await mockUSDC.name();
  const usdcSymbol = await mockUSDC.symbol();
  const usdcDecimals = await mockUSDC.decimals();
  const usdcTotalSupply = await mockUSDC.totalSupply();
  console.log("- Name:", usdcName);
  console.log("- Symbol:", usdcSymbol);
  console.log("- Decimals:", usdcDecimals);
  console.log("- Total Supply:", formatUnits(usdcTotalSupply, usdcDecimals));

  // Check WhaleNFT contract
  console.log("\nWhale NFT Contract:");
  const whaleNFT = await ethers.getContractAt("InvestorNFT", whaleNFTAddress);
  const whaleNFTName = await whaleNFT.name();
  const whaleNFTSymbol = await whaleNFT.symbol();
  console.log("- Name:", whaleNFTName);
  console.log("- Symbol:", whaleNFTSymbol);

  // Check OGNFT contract
  console.log("\nOG NFT Contract:");
  const ogNFT = await ethers.getContractAt("InvestorNFT", ogNFTAddress);
  const ogNFTName = await ogNFT.name();
  const ogNFTSymbol = await ogNFT.symbol();
  console.log("- Name:", ogNFTName);
  console.log("- Symbol:", ogNFTSymbol);

  // Check Alpha contracts
  await checkContracts(
    "Alpha",
    process.env.FUNDING_ADDRESS!,
    process.env.BOND_TOKEN_ADDRESS!,
    process.env.BOND_DISTRIBUTION_ADDRESS!
  );

  // Check Beta contracts
  await checkContracts(
    "Beta",
    process.env.FUNDING_BETA_ADDRESS!,
    process.env.BOND_TOKEN_BETA_ADDRESS!,
    process.env.BOND_DISTRIBUTION_BETA_ADDRESS!
  );

  // Check Zeta contracts
  await checkContracts(
    "Zeta",
    process.env.FUNDING_ZETA_ADDRESS!,
    process.env.BOND_TOKEN_ZETA_ADDRESS!,
    process.env.BOND_DISTRIBUTION_ZETA_ADDRESS!
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
