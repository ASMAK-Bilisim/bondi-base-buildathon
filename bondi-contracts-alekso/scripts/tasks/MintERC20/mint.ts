// just playing around
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("mint-erc20", "Mint ERC20Mock tokens to a specified address")
  .addParam("contract", "The address of the ERC20Mock contract")
  .addParam("to", "The address to mint tokens to")
  .addParam("amount", "The amount of tokens to mint")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { contract, to, amount } = taskArgs;

    // Get the contract instance
    const ERC20Mock = await hre.ethers.getContractAt("ERC20Mock", contract);

    // Get the signer (assuming the first signer is the owner)
    const [owner] = await hre.ethers.getSigners();

    try {
      // Mint tokens
      const tx = await ERC20Mock.connect(owner).mint(to, amount);
      await tx.wait();

      console.log(`Successfully minted ${amount} tokens to ${to}`);
      console.log(`Transaction hash: ${tx.hash}`);

      // Get and log the new balance
      const balance = await ERC20Mock.balanceOf(to);
      console.log(`New balance of ${to}: ${balance.toString()} tokens`);

    } catch (error) {
      console.error("Error minting tokens:", error);
    }
  });
