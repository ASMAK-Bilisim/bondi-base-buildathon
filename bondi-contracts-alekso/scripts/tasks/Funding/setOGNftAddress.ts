import { task } from "hardhat/config";

task("setOGAddress", "Set og nft contract address on deployed funding contract")
  .addOptionalParam("contract")
  .addOptionalParam("ogaddress")
  .setAction(async (taskArgs, hre) => {
    let { contract, ogaddress } = taskArgs;
    if (!contract) {
      contract = process.env.FUNDING_CONTRACT;
    }
    if (!ogaddress) {
      ogaddress = process.env.OG_CONTRACT;
    }
    const funding = await hre.ethers.getContractAt("Funding", contract);
    const ogTx = await funding.setOgNFTAddress(ogaddress);
    console.log(ogTx);
  });