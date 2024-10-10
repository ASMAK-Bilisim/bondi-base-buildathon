import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("FundingWithMintables", (m) => {
  const minimumInvestmentAmount = m.getParameter(
    "minimumInvestmentAmount",
    BigInt(process.env.MINIMUM_INVESTMENT_AMOUNT || "1000000")
  );
  const targetAmount = m.getParameter(
    "targetAmount",
    BigInt(process.env.TARGET_AMOUNT || "100000000")
  );
  const fundingPeriodLimitInDays = m.getParameter("fundingPeriodLimitInDays", process.env.FUNDING_PERIOD_LIMIT_DAYS || "30");
  const usdcTokenAddress = m.getParameter("usdcTokenAddress", process.env.USDC_TOKEN_ADDRESS);

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

  const bondToken = m.contract("BondToken", ["Bond Token", "BT"], { id: "BondTokenContract" });

  const bondDistribution = m.contract("BondDistribution", [bondToken, funding, usdcTokenAddress], { id: "BondDistributionContract" });

  m.call(bondToken, "addMinter", [bondDistribution], { id: "AddMinterToBondToken" });

  // Set BondDistribution address in Funding contract
  m.call(funding, "setBondDistribution", [bondDistribution], { id: "SetBondDistribution" });

  return { funding, ogNft, whaleNft, bondToken, bondDistribution };
});
