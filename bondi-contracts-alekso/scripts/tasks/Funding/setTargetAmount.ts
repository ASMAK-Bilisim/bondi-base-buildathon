import { task } from "hardhat/config";

task("setTargetAmount", "Set target amount on deployed funding contract")
  .addOptionalParam("contract")
  .addParam("targetamount")
  .setAction(async (taskArgs, hre) => {
    let { contract, targetamount } = taskArgs; 
    if (!contract) {
      contract = process.env.FUNDING_CONTRACT;
    }
    const funding = await hre.ethers.getContractAt("Funding", contract);
    const targetAmountTx = await funding.setTargetAmount(targetamount);
    console.log(targetAmountTx);
  });