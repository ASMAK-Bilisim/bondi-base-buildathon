import { task } from "hardhat/config";
import { formatUnits } from "ethers";

task("getMinimumAmount", "Get the minimum investment amount")
  .setAction(async (taskArgs, hre) => {
    const fundingAddress = process.env.FUNDING_ADDRESS;
    if (!fundingAddress) {
      throw new Error("FUNDING_ADDRESS not set in .env file");
    }

    const funding = await hre.ethers.getContractAt("Funding", fundingAddress);
    
    // Assuming there's a getter function for minimumInvestmentAmount in your Funding contract
    // If there isn't, you might need to add one to your Funding contract
    const minimumInvestmentAmount = await funding.minimumInvestmentAmount();
    console.log("Minimum Investment Amount:", formatUnits(minimumInvestmentAmount, 6));
  });