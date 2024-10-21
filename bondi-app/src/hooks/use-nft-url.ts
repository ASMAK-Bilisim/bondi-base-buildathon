import { useQuery } from "react-query";
import { createPublicClient, http, parseAbi } from "viem";
import { baseSepolia } from "viem/chains";
import axios from "axios";
import { useAppContext } from "../providers/app-context";
import { useWalletClient } from "./use-wallet-client";

// ERC721 ABI for tokenURI
const erc721Abi = parseAbi([
  "function tokenURI(uint256 tokenId) view returns (string)",
]);

// Function to get metadata for a specific tokenId
async function fetchNFTMetadata(
  contractAddress: `0x${string}`,
  tokenId: bigint
) {
  try {
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    // Fetch the tokenURI (metadata URL)
    const tokenUri = await client.readContract({
      address: contractAddress,
      abi: erc721Abi,
      functionName: "tokenURI",
      args: [tokenId],
    });

    console.log(`Token URI for tokenId ${tokenId}: ${tokenUri}`);

    // Handle IPFS URIs
    const metadataUrl = tokenUri.startsWith("ipfs://")
      ? `https://ipfs.io/ipfs/${tokenUri.slice(7)}`
      : tokenUri;

    // Fetch the metadata JSON from the tokenURI
    const metadataResponse = await axios.get(metadataUrl);
    const metadata = metadataResponse.data;

    // Log the metadata and image URL
    console.log(`Metadata for tokenId ${tokenId}:`, metadata);

    // Handle IPFS image URLs
    const imageUrl = metadata.image.startsWith("ipfs://")
      ? `https://ipfs.io/ipfs/${metadata.image.slice(7)}`
      : metadata.image;

    console.log(`Image URL for tokenId ${tokenId}: ${imageUrl}`);

    // Return the resolved image URL
    return imageUrl;
  } catch (error) {
    console.error("Error fetching NFT metadata:", error);
  }
}

export function useNFTUrl() {
  const {
    ogNftTransfers,
    whaleNftTransfers,
    OG_NFT_ADDRESS,
    WHALE_NFT_ADDRESS,
  } = useAppContext();

  const walletClient = useWalletClient();
  const walletAddress = walletClient.data?.account?.address;

  // Select the latest NFT transfer and contract address for the wallet address
  const { latestContractAddress, latestTokenId } = (() => {
    if (!walletAddress) {
      return { latestContractAddress: undefined, latestTokenId: undefined };
    }

    const ogTransfer = ogNftTransfers
      .filter((transfer) => transfer.args.to === walletAddress)
      .slice(-1)[0];
    const whaleTransfer = whaleNftTransfers
      .filter((transfer) => transfer.args.to === walletAddress)
      .slice(-1)[0];

    if (!ogTransfer && !whaleTransfer) {
      return { latestContractAddress: undefined, latestTokenId: undefined };
    }

    if (
      !ogTransfer ||
      (whaleTransfer && whaleTransfer.blockNumber > ogTransfer.blockNumber)
    ) {
      return {
        latestContractAddress: WHALE_NFT_ADDRESS,
        latestTokenId: BigInt(whaleTransfer.args.tokenId),
      };
    }

    return {
      latestContractAddress: OG_NFT_ADDRESS,
      latestTokenId: BigInt(ogTransfer.args.tokenId),
    };
  })();

  const query = useQuery({
    queryKey: [
      "nftUrl",
      latestContractAddress,
      latestTokenId?.toString(), // Convert BigInt to string
      walletAddress,
    ],
    queryFn: () =>
      latestContractAddress && latestTokenId
        ? fetchNFTMetadata(latestContractAddress, latestTokenId)
        : undefined,
    enabled: !!latestContractAddress && !!latestTokenId && !!walletAddress,
  });

  fetchNFTMetadata(OG_NFT_ADDRESS, 5n).then((res) => {
    console.log(res);
  });

  return query;
}
