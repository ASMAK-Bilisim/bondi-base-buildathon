"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils/utils");
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
module.exports = buildModule("InvestorNFT", (m) => {
    const tokenName = m.getParameter("tokenName", process.env.INVESTORNFT_TOKEN_NAME);
    const tokenSymbol = m.getParameter("tokenSymbol", process.env.INVESTORNFT_TOKEN_SYMBOL);
    const minter = m.getParameter("minter", process.env.INVESTORNFT_MINTER);
    const investorId = (0, utils_1.increaseItemId)("InvestorNFT");
    const investorNft = m.contract("InvestorNFT", [
        tokenName,
        tokenSymbol,
        minter
    ], { id: `InvestorNFT_${investorId}` });
    return { investorNft };
});
