import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { config } from 'dotenv';

// Load environment variables
config();

export default buildModule("FundingWithMintables", (m) => {
  const minimumInvestmentAmount = m.getParameter(
    "minimumInvestmentAmount",
    BigInt(process.env.MINIMUM_INVESTMENT_AMOUNT!)
  );
  const targetAmount = m.getParameter(
    "targetAmount",
    BigInt(process.env.TARGET_AMOUNT!)
  );
  const fundingPeriodLimitInDays = m.getParameter(
    "fundingPeriodLimitInDays",
    parseInt(process.env.FUNDING_PERIOD_LIMIT_DAYS!, 10)
  );
  const usdcTokenAddress = m.getParameter(
    "usdcTokenAddress",
    process.env.USDC_TOKEN_ADDRESS!
  );
  const ogNftBaseUri = m.getParameter(
    "ogNftBaseUri",
    process.env.OG_NFT_BASE_URI!
  );
  const whaleNftBaseUri = m.getParameter(
    "whaleNftBaseUri",
    process.env.WHALE_NFT_BASE_URI!
  );

  console.log("Parsed values:");
  console.log("minimumInvestmentAmount:", minimumInvestmentAmount.toString());
  console.log("targetAmount:", targetAmount.toString());
  console.log("fundingPeriodLimitInDays:", fundingPeriodLimitInDays);
  console.log("usdcTokenAddress:", usdcTokenAddress);
  console.log("ogNftBaseUri:", ogNftBaseUri);
  console.log("whaleNftBaseUri:", whaleNftBaseUri);

  if (!usdcTokenAddress) {
    throw new Error("USDC_TOKEN_ADDRESS is not set in the environment variables");
  }

  const funding = m.contract("Funding", [
    minimumInvestmentAmount,
    targetAmount,
    fundingPeriodLimitInDays,
    usdcTokenAddress
  ], { id: "FundingContract" });

  const ogNft = m.contract("InvestorNFT", ["OG Investor", "OGI", funding], { id: "OGInvestorNFT" });
  const whaleNft = m.contract("InvestorNFT", ["Whale Investor", "WHI", funding], { id: "WhaleInvestorNFT" });

  m.call(funding, "setOgNFTAddress", [ogNft], { id: "SetOGNFTAddress" });
  m.call(funding, "setWhaleNFTAddress", [whaleNft], { id: "SetWhaleNFTAddress" });

  // Set base URIs for NFTs
  m.call(ogNft, "setBaseURI", [ogNftBaseUri], { id: "SetOGNFTBaseURI" });
  m.call(whaleNft, "setBaseURI", [whaleNftBaseUri], { id: "SetWhaleNFTBaseURI" });

  const bondToken = m.contract("BondToken", [
    process.env.BOND_TOKEN_NAME!,
    process.env.BOND_TOKEN_SYMBOL!
  ], { id: "BondTokenContract" });

  const bondDistribution = m.contract("BondDistribution", [bondToken, funding, usdcTokenAddress], { id: "BondDistributionContract" });

  m.call(bondToken, "addMinter", [bondDistribution], { id: "AddMinterToBondToken" });

  m.call(funding, "setBondDistribution", [bondDistribution], { id: "SetBondDistribution" });

  return { funding, ogNft, whaleNft, bondToken, bondDistribution };
});
