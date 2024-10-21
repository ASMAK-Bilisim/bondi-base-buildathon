import { createPublicClient, http, parseAbi } from "viem";
import { baseSepolia } from "viem/chains";
import axios from "axios";

// ERC721 ABI for tokenURI
const erc721Abi = parseAbi([
  "function tokenURI(uint256 tokenId) view returns (string)",
]);

// Function to get metadata for a specific tokenId
export async function fetchNFTMetadata(
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

    // Fetch the metadata JSON from the tokenURI
    const metadataResponse = await axios.get(tokenUri);
    const metadata = metadataResponse.data;

    // Log the metadata and image URL
    console.log(`Metadata for tokenId ${tokenId}:`, metadata);
    console.log(`Image URL for tokenId ${tokenId}: ${metadata.image}`);

    // You can now use this image URL to display the image in your application
    return metadata.image as string;
  } catch (error) {
    console.error("Error fetching NFT metadata:", error);
  }
}
