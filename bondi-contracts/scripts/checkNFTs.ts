import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function main() {
  const ogNFTAddress = process.env.OG_NFT_ADDRESS;
  const whaleNFTAddress = process.env.WHALE_NFT_ADDRESS;

  if (!ogNFTAddress || !whaleNFTAddress) {
    throw new Error("NFT addresses not set in scripts/.env file");
  }

  const ogNFT = await ethers.getContractAt("InvestorNFT", ogNFTAddress);
  const whaleNFT = await ethers.getContractAt("InvestorNFT", whaleNFTAddress);

  const signers = await ethers.getSigners();
  const investors = signers.slice(1, 6); // Get investors at indices 1 to 5

  console.log("Checking NFT balances for investors...");

  let totalOGNFTs = 0;
  let totalWhaleNFTs = 0;

  for (let i = 0; i < investors.length; i++) {
    const investor = investors[i];
    const ogBalance = await ogNFT.balanceOf(investor.address);
    const whaleBalance = await whaleNFT.balanceOf(investor.address);

    console.log(`\nInvestor ${i + 1} (Index ${i + 1}) (${investor.address}):`);
    console.log(`  OG NFT Balance: ${ogBalance.toString()}`);
    console.log(`  Whale NFT Balance: ${whaleBalance.toString()}`);

    totalOGNFTs += Number(ogBalance);
    totalWhaleNFTs += Number(whaleBalance);
  }

  console.log("\nNFT minting summary:");
  console.log(`  Total OG NFTs minted: ${totalOGNFTs}`);
  console.log(`  Total Whale NFTs minted: ${totalWhaleNFTs}`);

  // Check nextTokenId for each NFT
  const ogNextTokenId = await ogNFT.nextTokenId();
  const whaleNextTokenId = await whaleNFT.nextTokenId();

  console.log("\nNext Token IDs:");
  console.log(`  OG NFT Next Token ID: ${ogNextTokenId.toString()}`);
  console.log(`  Whale NFT Next Token ID: ${whaleNextTokenId.toString()}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
