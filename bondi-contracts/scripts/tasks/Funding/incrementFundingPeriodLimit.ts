import { task } from "hardhat/config";

task("incrementFundingPeriodLimit", "Increment funding period limit on deployed Funding contract")
  .addOptionalParam("contract")
  .addParam("daystoincrement")
  .setAction(async (taskArgs, hre) => {
    let { contract, daystoincrement } = taskArgs; 
    if (!contract) {
      contract = process.env.FUNDING_CONTRACT;
    }
    const funding = await hre.ethers.getContractAt("Funding", contract);
    const incrementTx = await funding.incrementFundingPeriodLimit(daystoincrement);
    console.log(incrementTx);
  });