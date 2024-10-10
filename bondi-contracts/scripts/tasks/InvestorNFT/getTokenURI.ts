import { task } from "hardhat/config";

task("getTokenUri", "Get tokenURI for a tokenID from deployed InvestorNFT contract")
  .addOptionalParam("contract")
  .addParam("tokenid")
  .setAction(async (taskArgs, hre) => {
    let { contract, tokenid } = taskArgs;
    if (!contract) {
      contract = process.env.INVESTORNFT_CONTRACT;
    }

    const investorNft = await hre.ethers.getContractAt("InvestorNFT", contract);

    const tokenUri = await investorNft.tokenURI(tokenid);
    console.log("tx: ", tokenUri);
  });