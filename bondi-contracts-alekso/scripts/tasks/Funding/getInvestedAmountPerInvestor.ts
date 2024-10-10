import { task } from "hardhat/config";

task("getInvestedAmount", "Get invested amount by investor from deployed funding contract")
  .addOptionalParam("contract")
  .addParam("investor")
  .setAction(async (taskArgs, hre) => {
    let { contract, investor } = taskArgs;
    if (!contract) {
      contract = process.env.FUNDING_CONTRACT;
    }
    const funding = await hre.ethers.getContractAt("Funding", contract);
    const investedAmount = await funding.investedAmountPerInvestor(investor);
    console.log(investedAmount);
  });