import { ethers } from "hardhat";

async function main() {
  const ogNFTAddress = process.env.OG_NFT_ADDRESS;
  const whaleNFTAddress = process.env.WHALE_NFT_ADDRESS;

  if (!ogNFTAddress || !whaleNFTAddress) {
    throw new Error("Please set OG_NFT_ADDRESS and WHALE_NFT_ADDRESS in the .env file");
  }

  const ogNFT = await ethers.getContractAt("InvestorNFT", ogNFTAddress);
  const whaleNFT = await ethers.getContractAt("InvestorNFT", whaleNFTAddress);

  const [, investor1, investor2, investor3, investor4, investor5] = await ethers.getSigners();
  const investors = [investor1, investor2, investor3, investor4, investor5];

  console.log("Checking NFT URIs for investors...");

  for (let i = 0; i < investors.length; i++) {
    const investor = investors[i];
    console.log(`\nInvestor ${i + 1} (${investor.address}):`);

    const ogBalance = await ogNFT.balanceOf(investor.address);
    const whaleBalance = await whaleNFT.balanceOf(investor.address);

    if (ogBalance > 0) {
      try {
        const ogTokenURI = await ogNFT.tokenURI(i);
        console.log(`  OG NFT URI: ${ogTokenURI}`);
      } catch (error: any) {
        console.log(`  Error fetching OG NFT URI: ${error.message}`);
      }
    } else {
      console.log("  No OG NFT owned by this investor");
    }

    if (whaleBalance > 0) {
      try {
        const whaleTokenURI = await whaleNFT.tokenURI(i - 2);  // Whale NFTs start from the 3rd investor
        console.log(`  Whale NFT URI: ${whaleTokenURI}`);
      } catch (error: any) {
        console.log(`  Error fetching Whale NFT URI: ${error.message}`);
      }
    } else {
      console.log("  No Whale NFT owned by this investor");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});