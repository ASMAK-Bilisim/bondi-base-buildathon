import { types, task } from "hardhat/config";

task("getTargetAmount", "Get target amount from deployed funding contract")
  .addOptionalParam("contract")
  .setAction(async (taskArgs, hre) => {
    let { contract } = taskArgs;
    if (!contract) {
      contract = process.env.FUNDING_CONTRACT;
    }
    const funding = await hre.ethers.getContractAt("Funding", contract);
    const targetAmount = await funding.targetAmount();
    console.log(targetAmount);
  });