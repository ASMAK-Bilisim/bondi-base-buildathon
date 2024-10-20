import { ethers, utils } from "ethers";
import { encodeFunctionData, namehash } from "viem";
import { normalize } from "viem/ens";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'src', '.env') });

// Base Sepolia Registrar Controller Contract Address.
const BaseNamesRegistrarControllerAddress = "0x49aE3cC2e3AA768B1e5654f5D3C6002144A59581";

// Base Sepolia L2 Resolver Contract Address.
const L2ResolverAddress = "0x6533C94869D28fAA8dF77cc63f9e2b2D6Cf77eBA";

// The regular expression to validate a Basename on Base Sepolia.
const baseNameRegex = /\.basetest\.eth$/;

// Relevant ABI for L2 Resolver Contract.
const l2ResolverABI = [
  {
    inputs: [
      { internalType: "bytes32", name: "node", type: "bytes32" },
      { internalType: "address", name: "a", type: "address" },
    ],
    name: "setAddr",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "node", type: "bytes32" },
      { internalType: "string", name: "newName", type: "string" },
    ],
    name: "setName",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Relevant ABI for Basenames Registrar Controller Contract.
const registrarABI = [
  {
    inputs: [
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "uint256", name: "duration", type: "uint256" },
          { internalType: "address", name: "resolver", type: "address" },
          { internalType: "bytes[]", name: "data", type: "bytes[]" },
          { internalType: "bool", name: "reverseRecord", type: "bool" },
        ],
        internalType: "struct RegistrarController.RegisterRequest",
        name: "request",
        type: "tuple",
      },
    ],
    name: "register",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

// Create register contract method arguments.
function createRegisterContractMethodArgs(baseName, addressId) {
  const fullName = `${baseName}.basetest.eth`;
  
  // Use ethers.utils.namehash and ethers.utils.keccak256
  const nameHash = ethers.utils.namehash(fullName);
  const labelHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(baseName));

  console.log(`Full name: ${fullName}`);
  console.log(`Computed namehash: ${nameHash}`);
  console.log(`Computed labelhash: ${labelHash}`);

  const addressData = encodeFunctionData({
    abi: l2ResolverABI,
    functionName: "setAddr",
    args: [nameHash, addressId],
  });
  const nameData = encodeFunctionData({
    abi: l2ResolverABI,
    functionName: "setName",
    args: [nameHash, fullName],
  });

  const registerArgs = [
    {
      name: baseName,
      owner: addressId,
      duration: "31557600",
      resolver: L2ResolverAddress,
      data: [addressData, nameData],
      reverseRecord: true,
    },
  ];
  console.log(`Register contract method arguments constructed: `, JSON.stringify(registerArgs, null, 2));

  return registerArgs;
}

async function registerBaseName(wallet, registerArgs) {
  try {
    const contract = new ethers.Contract(BaseNamesRegistrarControllerAddress, registrarABI, wallet);
    
    console.log("Estimating gas...");
    const estimatedGas = await contract.estimateGas.register(...registerArgs, { value: ethers.utils.parseEther("0.002") });
    console.log(`Estimated gas: ${estimatedGas.toString()}`);
    
    console.log("Sending transaction...");
    const tx = await contract.register(...registerArgs, { 
      value: ethers.utils.parseEther("0.002"),
      gasLimit: estimatedGas.mul(120).div(100) // Add 20% buffer to estimated gas
    });
    console.log("Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log(`Successfully registered Basename ${registerArgs[0].name} for wallet: ${wallet.address}`);
    return receipt;
  } catch (error) {
    console.error(`Error registering a Basename for ${wallet.address}: `, error);
    if (error.error && error.error.data) {
      const decodedError = ethers.utils.toUtf8String('0x' + error.error.data.slice(138));
      console.error("Decoded error:", decodedError);
    }
    throw error;
  }
}

async function main() {
  try {
    const { BASE_NAME, PRIVATE_KEY } = process.env;

    if (!BASE_NAME || !PRIVATE_KEY) {
      console.error('BASE_NAME or PRIVATE_KEY environment variables are not set');
      process.exit(1);
    }

    // Create a wallet instance using the private key
    const provider = new ethers.providers.JsonRpcProvider("https://base-sepolia-rpc.publicnode.com");
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    console.log('Wallet address:', wallet.address);

    // Register Basename using the wallet's address
    const registerArgs = createRegisterContractMethodArgs(BASE_NAME,"0xe48B71132F2E8df6De19C13Ed1D68b52D82f094A");
    await registerBaseName(wallet, registerArgs);
  } catch (error) {
    console.error(`Error in registering a Basename for my wallet: `, error);
  }
}

// Call the main function
main().catch(console.error);
