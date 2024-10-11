import { task } from "hardhat/config";

task("mintERC20", "Mint ERC20 tokens")
  .addParam("to", "The address that will receive the minted tokens")
  .addParam("amount", "The amount of tokens to mint")
  .setAction(async (taskArgs, hre) => {
    const { to, amount } = taskArgs;
    const mockUSDCAddress = process.env.MOCK_USDC_ADDRESS;
    if (!mockUSDCAddress) {
      throw new Error("MOCK_USDC_ADDRESS not set in .env file");
    }

    const [owner] = await hre.ethers.getSigners();
    const MockUSDC = await hre.ethers.getContractAt("MockUSDC", mockUSDCAddress);

    try {
      const tx = await MockUSDC.connect(owner).claim();
      await tx.wait();
      console.log(`Claimed tokens for ${owner.address}`);
    } catch (error) {
      console.error("Error minting tokens:", error);
    }
  });
