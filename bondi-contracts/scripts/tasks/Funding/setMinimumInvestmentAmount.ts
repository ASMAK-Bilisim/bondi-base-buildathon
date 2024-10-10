import { task } from "hardhat/config";

task("setMinimumInvestmentAmount", "Set minimum investment amount on deployed funding contract")
  .addOptionalParam("contract")
  .addParam("minimuminvestment")
  .setAction(async (taskArgs, hre) => {
    let { contract, minimuminvestment } = taskArgs; 
    if (!contract) {
      contract = process.env.FUNDING_CONTRACT;
    }
    if (!minimuminvestment) {
      minimuminvestment = process.env.FUNDING_MINIMUM_INVESTMENT;
    }
    const funding = await hre.ethers.getContractAt("Funding", contract);
    const minimumInvestmentTx = await funding.setMinimumInvestmentAmount(minimuminvestment);
    console.log(minimumInvestmentTx);
  });