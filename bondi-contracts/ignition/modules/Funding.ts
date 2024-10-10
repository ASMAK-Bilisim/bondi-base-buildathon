import { increaseItemId } from "./utils/utils";

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("Funding", (m: any) => {
  const minimumInvestmentAmount = m.getParameter("minimumInvestmentAmount", process.env.MINIMUM_INVESTMENT_AMOUNT);
  const targetAmount = m.getParameter("targetAmount", process.env.TARGET_AMOUNT);
  const fundingPeriodLimitInDays = m.getParameter("fundingPeriodLimitInDays", process.env.FUNDING_PERIOD_LIMIT_DAYS);
  const usdcTokenAddress = m.getParameter("usdcTokenAddress", process.env.USDC_TOKEN_ADDRESS);

  const fundingId = increaseItemId("Funding");
  const funding = m.contract(
    "Funding",
    [
        minimumInvestmentAmount,
        targetAmount,
        fundingPeriodLimitInDays,
        usdcTokenAddress
    ],
    { id: `Funding_${fundingId}` }  
  );

  return { funding };
});
