import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  const fundingAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // Replace with the actual address after deployment
  const funding = await ethers.getContractAt("Funding", fundingAddress);

  const DEFAULT_ADMIN_ROLE = await funding.DEFAULT_ADMIN_ROLE();
  
  console.log("Granting DEFAULT_ADMIN_ROLE to deployer...");
  await funding.grantRole(DEFAULT_ADMIN_ROLE, deployer.address);
  console.log("DEFAULT_ADMIN_ROLE granted to:", deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});