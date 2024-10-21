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

  // Select the latest NFT transfers for both OG and Whale NFTs
  const { ogNft, whaleNft } = (() => {
    if (!walletAddress) {
      return { ogNft: undefined, whaleNft: undefined };
    }

    const ogTransfer = ogNftTransfers
      .filter((transfer) => transfer.args.to === walletAddress)
      .slice(-1)[0];
    const whaleTransfer = whaleNftTransfers
      .filter((transfer) => transfer.args.to === walletAddress)
      .slice(-1)[0];

    return {
      ogNft: ogTransfer
        ? {
            contractAddress: OG_NFT_ADDRESS,
            tokenId: BigInt(ogTransfer.args.tokenId),
            nftType: 'og' as const,
          }
        : undefined,
      whaleNft: whaleTransfer
        ? {
            contractAddress: WHALE_NFT_ADDRESS,
            tokenId: BigInt(whaleTransfer.args.tokenId),
            nftType: 'whale' as const,
          }
        : undefined,
    };
  })();

  const query = useQuery({
    queryKey: [
      "nftUrls",
      ogNft?.contractAddress,
      ogNft?.tokenId?.toString(),
      whaleNft?.contractAddress,
      whaleNft?.tokenId?.toString(),
      walletAddress,
    ],
    queryFn: async () => {
      const results: Record<'og' | 'whale', { imageUrl: string | undefined; nftType: 'og' | 'whale' }> = {
        og: { imageUrl: undefined, nftType: 'og' },
        whale: { imageUrl: undefined, nftType: 'whale' }
      };

      if (ogNft) {
        const imageUrl = await fetchNFTMetadata(ogNft.contractAddress, ogNft.tokenId);
        results.og = { imageUrl, nftType: ogNft.nftType };
      }

      if (whaleNft) {
        const imageUrl = await fetchNFTMetadata(whaleNft.contractAddress, whaleNft.tokenId);
        results.whale = { imageUrl, nftType: whaleNft.nftType };
      }

      return results;
    },
    enabled: !!walletAddress && (!!ogNft || !!whaleNft),
  });

  return query;
}
