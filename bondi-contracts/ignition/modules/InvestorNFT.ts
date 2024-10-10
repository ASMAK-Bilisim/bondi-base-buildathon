import { increaseItemId } from "./utils/utils";

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("InvestorNFT", (m: any) => {
  const tokenName = m.getParameter("tokenName", process.env.INVESTORNFT_TOKEN_NAME);
  const tokenSymbol = m.getParameter("tokenSymbol", process.env.INVESTORNFT_TOKEN_SYMBOL);
  const minter = m.getParameter("minter", process.env.INVESTORNFT_MINTER);

  const investorId = increaseItemId("InvestorNFT");
  const investorNft = m.contract(
    "InvestorNFT",
    [
        tokenName,
        tokenSymbol,
        minter
    ],
  {id: `InvestorNFT_${investorId}`});

  return { investorNft };
});
