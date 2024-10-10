import { ethers } from "hardhat";

async function main() {
  const fundingAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const funding = await ethers.getContractAt("Funding", fundingAddress);

  const ogNFTAddress = await funding.ogNFT();
  const whaleNFTAddress = await funding.whaleNFT();

  const ogNFT = await ethers.getContractAt("InvestorNFT", ogNFTAddress);
  const whaleNFT = await ethers.getContractAt("InvestorNFT", whaleNFTAddress);

  const [, investor1, investor2, investor3, investor4, investor5] = await ethers.getSigners();
  const investors = [investor1, investor2, investor3, investor4, investor5];

  console.log("Checking NFT balances for investors...");

  let totalOGNFTs = 0;
  let totalWhaleNFTs = 0;

  for (let i = 0; i < investors.length; i++) {
    const investor = investors[i];
    const ogBalance = await ogNFT.balanceOf(investor.address);
    const whaleBalance = await whaleNFT.balanceOf(investor.address);
    const investedAmount = await funding.investedAmountPerInvestor(investor.address);

    console.log(`Investor ${i + 1} (${investor.address}):`);
    console.log(`  Invested Amount: ${ethers.formatUnits(investedAmount.investedAmount, 6)} USDC`);
    console.log(`  OG NFT Balance: ${ogBalance.toString()}`);
    console.log(`  Whale NFT Balance: ${whaleBalance.toString()}`);
    console.log();

    totalOGNFTs += Number(ogBalance);
    totalWhaleNFTs += Number(whaleBalance);
  }

  console.log("NFT minting summary:");
  console.log(`  Total OG NFTs minted: ${totalOGNFTs}`);
  console.log(`  Total Whale NFTs minted: ${totalWhaleNFTs}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});