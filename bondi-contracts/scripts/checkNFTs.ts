import { ethers } from "hardhat";

async function main() {
  const fundingAddress = process.env.FUNDING_ADDRESS;
  if (!fundingAddress) {
    throw new Error("FUNDING_ADDRESS not set in .env file");
  }
  const funding = await ethers.getContractAt("Funding", fundingAddress);

  const ogNFTAddress = await funding.ogNFT();
  const whaleNFTAddress = await funding.whaleNFT();

  const ogNFT = await ethers.getContractAt("InvestorNFT", ogNFTAddress);
  const whaleNFT = await ethers.getContractAt("InvestorNFT", whaleNFTAddress);

  const signers = await ethers.getSigners();
  const investors = signers.slice(1, 11); // Get investors at indices 1 to 10

  console.log("Checking NFT balances for investors...");

  let totalOGNFTs = 0;
  let totalWhaleNFTs = 0;

  for (let i = 0; i < investors.length; i++) {
    const investor = investors[i];
    const ogBalance = await ogNFT.balanceOf(investor.address);
    const whaleBalance = await whaleNFT.balanceOf(investor.address);
    const investedAmount = await funding.investedAmountPerInvestor(investor.address);

    console.log(`Investor ${i + 1} (Index ${i + 1}) (${investor.address}):`);
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
