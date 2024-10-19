import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { increaseItemId } from "./utils/utils";

export default buildModule("Funding", (m) => {
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
  const ogNftAddress = m.getParameter(
    "ogNftAddress",
    process.env.OG_NFT_ADDRESS!
  );
  const whaleNftAddress = m.getParameter(
    "whaleNftAddress",
    process.env.WHALE_NFT_ADDRESS!
  );

  console.log("Parsed values:");
  console.log("minimumInvestmentAmount:", minimumInvestmentAmount.toString());
  console.log("targetAmount:", targetAmount.toString());
  console.log("fundingPeriodLimitInDays:", fundingPeriodLimitInDays);
  console.log("usdcTokenAddress:", usdcTokenAddress);
  console.log("ogNftAddress:", ogNftAddress);
  console.log("whaleNftAddress:", whaleNftAddress);

  if (!usdcTokenAddress) {
    throw new Error("USDC_TOKEN_ADDRESS is not set in the environment variables");
  }

  const funding = m.contract("Funding", [
    minimumInvestmentAmount,
    targetAmount,
    fundingPeriodLimitInDays,
    usdcTokenAddress
  ], { id: `FundingContract_${increaseItemId("Funding")}` });

  m.call(funding, "setOgNFTAddress", [ogNftAddress], { id: "SetOGNFTAddress" });
  m.call(funding, "setWhaleNFTAddress", [whaleNftAddress], { id: "SetWhaleNFTAddress" });

  const bondToken = m.contract("BondToken", [
    process.env.BOND_TOKEN_NAME!,
    process.env.BOND_TOKEN_SYMBOL!
  ], { id: `BondTokenContract_${increaseItemId("BondToken")}` });

  const bondDistribution = m.contract("BondDistribution", [bondToken, funding, usdcTokenAddress], { id: `BondDistributionContract_${increaseItemId("BondDistribution")}` });

  m.call(bondToken, "addMinter", [bondDistribution], { id: "AddMinterToBondToken" });

  m.call(funding, "setBondDistribution", [bondDistribution], { id: "SetBondDistribution" });

  return { funding, bondToken, bondDistribution };
});
