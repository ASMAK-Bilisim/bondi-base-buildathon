import { ethers } from "hardhat";
import { MockUSDC } from "../typechain-types";

async function main() {
  const [owner, user1, user2, user3] = await ethers.getSigners();

  // Use the deployed MockUSDC contract address
  const mockUSDCAddress = "0x162cBA2E072906520bDa894b09D8a09B20cF9f80";
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = MockUSDC.attach(mockUSDCAddress) as MockUSDC;

  console.log("MockUSDC contract address:", mockUSDCAddress);

  // Check initial contract balance
  const initialBalance = await ethers.provider.getBalance(mockUSDCAddress);
  console.log("Initial contract balance:", ethers.formatEther(initialBalance), "ETH");

  // Check User1's initial balance
  const user1InitialBalance = await ethers.provider.getBalance(user1.address);
  console.log("User1 initial balance:", ethers.formatEther(user1InitialBalance), "ETH");

  // User1 claims ETH
  console.log("User1 claiming ETH...");
  let tx = await mockUSDC.connect(user1).claimETH();
  await tx.wait();

  // Check User1's balance after claim
  const user1BalanceAfterClaim = await ethers.provider.getBalance(user1.address);
  console.log("User1 balance after claim:", ethers.formatEther(user1BalanceAfterClaim), "ETH");

  // Check contract balance after first claim
  const balanceAfterFirstClaim = await ethers.provider.getBalance(mockUSDCAddress);
  console.log("Contract balance after first claim:", ethers.formatEther(balanceAfterFirstClaim), "ETH");

  // Check User2's initial balance
  const user2InitialBalance = await ethers.provider.getBalance(user2.address);
  console.log("User2 initial balance:", ethers.formatEther(user2InitialBalance), "ETH");

  // User2 claims ETH
  console.log("User2 claiming ETH...");
  tx = await mockUSDC.connect(user2).claimETH();
  await tx.wait();

  // Check User2's balance after claim
  const user2BalanceAfterClaim = await ethers.provider.getBalance(user2.address);
  console.log("User2 balance after claim:", ethers.formatEther(user2BalanceAfterClaim), "ETH");

  // Check User3's initial balance
  const user3InitialBalance = await ethers.provider.getBalance(user3.address);
  console.log("User3 initial balance:", ethers.formatEther(user3InitialBalance), "ETH");

  // User3 claims ETH
  console.log("User3 claiming ETH...");
  tx = await mockUSDC.connect(user3).claimETH();
  await tx.wait();

  // Check User3's balance after claim
  const user3BalanceAfterClaim = await ethers.provider.getBalance(user3.address);
  console.log("User3 balance after claim:", ethers.formatEther(user3BalanceAfterClaim), "ETH");

  // Check final contract balance
  const finalBalance = await ethers.provider.getBalance(mockUSDCAddress);
  console.log("Final contract balance:", ethers.formatEther(finalBalance), "ETH");

  console.log("ETH claims successful");

  // Try to claim again for User1 (should fail due to cooldown)
  try {
    console.log("User1 attempting to claim ETH again...");
    await mockUSDC.connect(user1).claimETH();
  } catch (error: any) {
    console.log("Error (expected):", error.message);
  }

  // Try to claim when contract is out of ETH
  try {
    console.log("User3 attempting to claim ETH when contract is out of funds...");
    await mockUSDC.connect(user3).claimETH();
  } catch (error: any) {
    console.log("Error (expected):", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
