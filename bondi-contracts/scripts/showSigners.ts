import { ethers } from "hardhat";

async function main() {
  const signers = await ethers.getSigners();
  const owner = signers[0];
  const investors = signers.slice(1, 6); // Get signers at indices 1, 2, 3, 4, 5

  console.log("Signer Addresses:");
  console.log("Owner:", owner.address);

  for (let i = 0; i < investors.length; i++) {
    console.log(`Investor ${i + 1} (Index ${i + 1}):`, investors[i].address);
  }

  // Show balances
  console.log("\nBalances:");
  console.log(`${owner.address} (Owner): ${ethers.formatEther(await ethers.provider.getBalance(owner.address))} ETH`);

  for (let i = 0; i < investors.length; i++) {
    const balance = await ethers.provider.getBalance(investors[i].address);
    console.log(`${investors[i].address} (Investor ${i + 1}, Index ${i + 1}): ${ethers.formatEther(balance)} ETH`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
