import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();

  // Updated MockUSDC contract address
  const mockUSDCAddress = "0x162cBA2E072906520bDa894b09D8a09B20cF9f80";

  console.log("Funding MockUSDC contract at:", mockUSDCAddress);

  // Send 0.1 ETH to the contract instead of 0.001
  const tx = await signer.sendTransaction({
    to: mockUSDCAddress,
    value: ethers.parseEther("0.1")
  });

  await tx.wait();
  console.log("Sent 0.1 ETH to MockUSDC contract");

  const balance = await ethers.provider.getBalance(mockUSDCAddress);
  console.log("MockUSDC contract balance:", ethers.formatEther(balance), "ETH");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
