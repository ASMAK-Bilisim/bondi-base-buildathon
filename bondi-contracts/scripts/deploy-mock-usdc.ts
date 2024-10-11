import { ethers } from "hardhat";

async function main() {
  console.log("Deploying MockUSDC...");

  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();

  await mockUSDC.deployed();

  console.log("MockUSDC deployed to:", mockUSDC.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});