import { task } from "hardhat/config";

task("setMinterRole", "Set minter role on deployed InvestorNFT contract")
  .addOptionalParam("contract")
  .addParam("minter")
  .setAction(async (taskArgs, hre) => {
    let { contract, minter } = taskArgs;
    if (!contract) {
      contract = process.env.INVESTORNFT_CONTRACT;
    }

    const investorNft = await hre.ethers.getContractAt("InvestorNFT", contract);

    const minterRole = await investorNft.MINTER_ROLE();
    const setMinterTx = await investorNft.grantRole(minterRole, minter);
    console.log("tx: ", setMinterTx);
  });