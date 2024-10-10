// just playing around
import { types, task } from "hardhat/config";

task("getInvestorAmount", "Get the number of investors from deployed funding contract")
  .addOptionalParam("contract")
  .setAction(async (taskArgs, hre) => {
    let { contract } = taskArgs;
    if (!contract) {
      contract = process.env.FUNDING_CONTRACT;
    }
    const funding = await hre.ethers.getContractAt("Funding", contract);
    const investorAmount = await funding.getInvestorAmount();
    console.log(investorAmount);
  });