"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils/utils");
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
module.exports = buildModule("Funding", (m) => {
    const minimumInvestmentAmount = m.getParameter("minimumInvestmentAmount", process.env.MINIMUM_INVESTMENT_AMOUNT);
    const targetAmount = m.getParameter("targetAmount", process.env.TARGET_AMOUNT);
    const fundingPeriodLimitInDays = m.getParameter("fundingPeriodLimitInDays", process.env.FUNDING_PERIOD_LIMIT_DAYS);
    const usdcTokenAddress = m.getParameter("usdcTokenAddress", process.env.USDC_TOKEN_ADDRESS);
    const fundingId = (0, utils_1.increaseItemId)("Funding");
    const funding = m.contract("Funding", [
        minimumInvestmentAmount,
        targetAmount,
        fundingPeriodLimitInDays,
        usdcTokenAddress
    ], { id: `Funding_${fundingId}` });
    return { funding };
});
