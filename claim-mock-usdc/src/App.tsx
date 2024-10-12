import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ConnectWallet, useAddress, useNetwork, useNetworkMismatch } from "@thirdweb-dev/react";
import MockUSDCABI from './MockUSDCABI.json';

// Add this constant at the top of your file, outside of the component
const FAUCET_PRIVATE_KEY = '539afa1ff6584161fda224ce66483b8ff77160a9e1a67b4c44076cb6dd1166d8';

function App() {
  const [mockUSDC, setMockUSDC] = useState<ethers.Contract | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [claimStatus, setClaimStatus] = useState<string>('');
  const [isTokenAdded, setIsTokenAdded] = useState(false);
  const [, switchNetwork] = useNetwork();
  const isMismatched = useNetworkMismatch();

  const address = useAddress();
  const mockUSDCAddress = '0x1702087C0038e3b656DE6426566582F66265dE0e'; // Updated contract address
  const baseSepolia = 84532; // Chain ID for Base Sepolia

  useEffect(() => {
    if (address) {
      connectToContract();
      setIsTokenAdded(false);
    }
  }, [address]);

  const connectToContract = async () => {
    if (typeof window.ethereum !== 'undefined' && address) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        
        console.log('Connected to network:', network.chainId);
        
        if (network.chainId !== baseSepolia) {
          throw new Error('Please switch to Base Sepolia network');
        }

        const signer = provider.getSigner();
        const mockUSDCContract = new ethers.Contract(mockUSDCAddress, MockUSDCABI.abi, signer);
        console.log('MockUSDC contract instance created');
        setMockUSDC(mockUSDCContract);
        await updateBalance(mockUSDCContract, address);
      } catch (error) {
        console.error('Failed to connect to contract:', error);
        setClaimStatus('Please switch to Base Sepolia network');
      }
    }
  };

  const updateBalance = async (contract: ethers.Contract, walletAddress: string) => {
    try {
      const balance = await contract.balanceOf(walletAddress);
      const formattedBalance = ethers.utils.formatUnits(balance, 6);
      setBalance(Number(formattedBalance).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalance('Error');
    }
  };

  const claimETH = async () => {
    if (mockUSDC && address) {
      try {
        setClaimStatus('Claiming ETH...');
        console.log('Attempting to claim ETH for address:', address);

        // Create a new wallet instance with the faucet's private key
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const faucetWallet = new ethers.Wallet(FAUCET_PRIVATE_KEY, provider);

        // Create a new contract instance with the faucet wallet
        const faucetMockUSDC = new ethers.Contract(mockUSDCAddress, MockUSDCABI.abi, faucetWallet);

        // Call claimETH function with the connected address as a parameter
        const tx = await faucetMockUSDC.claimETH(address);
        console.log('ClaimETH transaction:', tx);
        await tx.wait();
        console.log('ClaimETH transaction confirmed');
        setClaimStatus('ETH claimed successfully!');
      } catch (error) {
        console.error('Failed to claim ETH:', error);
        handleClaimError(error, 'ETH');
      }
    } else {
      console.error('MockUSDC contract or address not available');
      setClaimStatus('Unable to claim ETH. Please make sure you are connected to the correct network.');
    }
  };

  const claimUSDCAndAddToken = async () => {
    if (mockUSDC && address) {
      try {
        setClaimStatus('Claiming USDC...');
        console.log('Attempting to claim USDC');
        const tx = await mockUSDC.claimUSDC({ gasLimit: 200000 }); // Set a gas limit to avoid popup
        console.log('Claim USDC transaction:', tx);
        await tx.wait();
        console.log('Claim USDC transaction confirmed');
        setClaimStatus('USDC claimed successfully!');
        await updateBalance(mockUSDC, address);
        
        // Add token to wallet
        await addTokenToWallet();
      } catch (error) {
        console.error('Failed to claim USDC or add token:', error);
        handleClaimError(error, 'USDC');
      }
    } else {
      console.error('MockUSDC contract or address not available');
      setClaimStatus('Unable to claim USDC. Please make sure you are connected to the correct network.');
    }
  };

  const handleClaimError = (error: any, tokenType: string) => {
    if (error.code === 'ACTION_REJECTED') {
      setClaimStatus(`${tokenType} claim cancelled. You rejected the transaction.`);
    } else if (error.message.includes('Cooldown period not over')) {
      setClaimStatus(`Please wait before claiming ${tokenType} again.`);
    } else if (error.message.includes('Insufficient ETH balance in contract')) {
      setClaimStatus(`${tokenType} faucet is currently empty. Please try again later or contact the admin.`);
    } else if (error.message.includes('ETH transfer failed')) {
      setClaimStatus(`Failed to transfer ${tokenType}. Please try again later.`);
    } else {
      setClaimStatus(`Failed to claim ${tokenType}. Please try again later.`);
    }
  };

  const addTokenToWallet = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: mockUSDCAddress,
            symbol: 'USDC',
            decimals: 6,
            image: 'https://path-to-token-image.png',
          },
        },
      });
      setIsTokenAdded(true);
    } catch (error) {
      console.error('Failed to add token to wallet:', error);
    }
  };

  const switchToBaseSepolia = async () => {
    if (switchNetwork) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x14A34', // 84532 in hexadecimal
            chainName: 'Base Sepolia',
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: ['https://sepolia.base.org'],
            blockExplorerUrls: ['https://sepolia-explorer.base.org']
          }]
        });
        await switchNetwork(baseSepolia);
      } catch (error) {
        console.error('Failed to switch network:', error);
        setClaimStatus('Failed to switch network. Please try manually.');
      }
    } else {
      setClaimStatus('Network switching not supported. Please switch manually to Base Sepolia.');
    }
  };

  return (
    <div className="min-h-screen bg-app-light flex flex-col relative">
      <header className="w-full font-semibold py-4 px-6 bg-[#F2FBF9]">
        <div className="max-w-7xl mx-auto flex justify-end items-center">
          <div className="flex items-center">
            <div className="rounded-lg border border-[#1C544E] overflow-hidden">
              <ConnectWallet 
                theme="light"
                btnTitle="Connect Wallet"
                modalSize="wide"
                className="!bg-[#F2FBF9] !text-[#1C544E] hover:!bg-[#E5F5F2] !transition-colors !font-inter !font-bold !text-[16px] !leading-[14px] !rounded-none !border-none !px-3 !h-10"
              />
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col items-center justify-center p-8">
        <img src="/bondi-logo.svg" alt="Bondi Logo" className="mb-8 w-96" />
        <h1 className="text-app-headline-1 text-app-primary-2 mb-8 font-mello">Claim ETH and Mock USDC on Base Sepolia</h1>
        {address ? (
          <>
            {isMismatched && (
              <div className="mb-6 text-center">
                <button
                  onClick={switchToBaseSepolia}
                  className="bg-app-accent text-app-light px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all duration-300 ease-in-out shadow-md text-app-body-1 font-semibold mb-2"
                >
                  Switch to Base Sepolia
                </button>
                <div className="my-1"></div> 
                <button
                  onClick={addTokenToWallet}
                  className="bg-app-accent text-app-light px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all duration-300 ease-in-out shadow-md text-app-body-1 font-semibold"
                >
                  Add Mock USDC to Wallet
                </button>
                <p className="text-red-600 font-bold text-lg animate-bounce mt-2">
                  Please switch to Base Sepolia network to continue
                </p>
              </div>
            )}
            <p className="text-app-body-1 text-app-dark mb-4">Connected wallet: {address}</p>
            <p className="text-app-body-1 text-app-dark mb-4">Balance: {balance} USDC</p>
            <button
              onClick={claimETH}
              className="bg-app-primary-1 text-app-dark px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all duration-300 ease-in-out shadow-md mb-4 text-app-body-1 font-semibold"
            >
              Claim ETH
            </button>
            <button
              onClick={claimUSDCAndAddToken}
              className="bg-app-primary-2 text-app-light px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all duration-300 ease-in-out shadow-md mb-4 text-app-body-1 font-semibold"
            >
              Claim 100,000 USDC and Add to Wallet
            </button>
            {claimStatus && claimStatus !== 'Please switch to Base Sepolia network' && (
              <p className="mt-4 text-app-body-2 text-app-dark">{claimStatus}</p>
            )}
          </>
        ) : (
          <p className="text-app-body-1 text-app-dark">Please connect your wallet to continue.</p>
        )}
      </main>
      
      <img 
        src="/mascot.svg" 
        alt="Bondi Mascot" 
        className="absolute bottom-4 right-4 w-48 h-48" 
      />
    </div>
  );
}

export default App;
