import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "ethers";

task("claimUSDC", "Claims USDC for a specified address")
  .addParam("address", "The address to claim USDC for")
  .setAction(async (taskArgs: { address: string }, hre: HardhatRuntimeEnvironment) => {
    const { address } = taskArgs;
    const mockUSDCAddress = process.env.USDC_TOKEN_ADDRESS;

    if (!mockUSDCAddress) {
      throw new Error("USDC_TOKEN_ADDRESS not set in .env file");
    }

    const MockUSDC = await hre.ethers.getContractAt("MockUSDC", mockUSDCAddress);

    console.log(`Claiming USDC for address: ${address}`);

    try {
      const tx = await MockUSDC.claimUSDC(address);
      await tx.wait();
      console.log(`Successfully claimed USDC for ${address}`);
      
      const balance = await MockUSDC.balanceOf(address);
      console.log(`New USDC balance: ${ethers.utils.formatUnits(balance, 6)} USDC`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error claiming USDC:", error.message);
      } else {
        console.error("An unknown error occurred while claiming USDC");
      }
    }
  });
