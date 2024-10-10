import { task } from "hardhat/config";

task("setBaseUri", "Set baseURI on deployed InvestorNFT contract")
  .addOptionalParam("contract")
  .addOptionalParam("baseuri")
  .setAction(async (taskArgs, hre) => {
    let { contract, baseuri } = taskArgs;
    if (!contract) {
      contract = process.env.INVESTORNFT_CONTRACT;
    }
    if (!baseuri) {
      baseuri = process.env.INVESTORNFT_BASE_URI;
    }

    const investorNft = await hre.ethers.getContractAt("InvestorNFT", contract);

    const setBaseUriTx = await investorNft.setBaseURI(baseuri);
    console.log("tx: ", setBaseUriTx);
  });