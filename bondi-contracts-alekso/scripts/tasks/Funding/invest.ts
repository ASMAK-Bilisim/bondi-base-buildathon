import { task } from "hardhat/config";

task("invest", "Invest into the deployed Funding contract")
  .addOptionalParam("fundingcontract")
  .addOptionalParam("usdccontract")
  .addParam("amounttoinvest")
  .setAction(async (taskArgs, hre) => {
    let { fundingcontract, usdccontract, amounttoinvest } = taskArgs; 
    if (!fundingcontract) {
      fundingcontract = process.env.FUNDING_CONTRACT;
    }
    if (!usdccontract) {
      usdccontract = process.env.USDC_TOKEN_CONTRACT;
    }

    const funding = await hre.ethers.getContractAt("Funding", fundingcontract);
    const usdcToken = await hre.ethers.getContractAt("ERC20", usdccontract);

    const approveInvestment = await usdcToken.approve(await funding.getAddress(), amounttoinvest);
    console.log("Approval: ", approveInvestment);
    const investTx = await funding.invest(amounttoinvest);
    console.log("Investment: ", investTx);
  });