import { task } from "hardhat/config";

task("setWhaleAddress", "Set whale nft contract address on deployed funding contract")
  .addOptionalParam("contract")
  .addOptionalParam("whaleaddress")
  .setAction(async (taskArgs, hre) => {
    let { contract, whaleaddress } = taskArgs;
    if (!contract) {
      contract = process.env.FUNDING_CONTRACT;
    }
    if (!whaleaddress) {
      whaleaddress = process.env.WHALE_CONTRACT;
    }
    const funding = await hre.ethers.getContractAt("Funding", contract);
    const whaleTx = await funding.setWhaleNFTAddress(whaleaddress);
    console.log(whaleTx);
  });