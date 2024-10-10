// just playing around
import { types, task } from "hardhat/config";

task("getMinInv", "Get minimum investment amount from deployed funding contract")
  .addOptionalParam("contract")
  .setAction(async (taskArgs, hre) => {
    let { contract } = taskArgs;
    if (!contract) {
      contract = process.env.FUNDING_CONTRACT;
    }
    const funding = await hre.ethers.getContractAt("Funding", contract);
    const minimumInvestmentAmount = await funding.minimumInvestmentAmount();
    console.log(minimumInvestmentAmount);
  });