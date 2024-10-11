import { ethers } from "hardhat";

async function main() {
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();

  await mockUSDC.waitForDeployment();

  console.log("MockUSDC deployed to:", await mockUSDC.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});