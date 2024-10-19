import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import MockUSDCABI from './MockUSDCABI.json';

const FAUCET_PRIVATE_KEY = import.meta.env.VITE_FAUCET_PRIVATE_KEY;
const mockUSDCAddress = import.meta.env.VITE_MOCK_USDC_ADDRESS;
const baseSepolia = parseInt(import.meta.env.VITE_BASE_SEPOLIA_CHAIN_ID);

declare global {
  interface Window {
    ethereum?: any;
  }
}

function App() {
  const [userAddress, setUserAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [claimStatus, setClaimStatus] = useState<string>('');
  const [isTokenAdded, setIsTokenAdded] = useState(false);

  const provider = new ethers.providers.JsonRpcProvider(`https://sepolia.base.org`);
  const faucetWallet = new ethers.Wallet(FAUCET_PRIVATE_KEY, provider);
  const mockUSDC = new ethers.Contract(mockUSDCAddress, MockUSDCABI.abi, faucetWallet);

  const updateBalances = useCallback(async (address: string) => {
    try {
      const usdcBalance = await mockUSDC.balanceOf(address);
      const formattedUsdcBalance = ethers.utils.formatUnits(usdcBalance, 6);
      setBalance(Number(formattedUsdcBalance).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }));

      const ethBalanceWei = await provider.getBalance(address);
      const formattedEthBalance = ethers.utils.formatEther(ethBalanceWei);
      setEthBalance(formattedEthBalance);
    } catch (error) {
      console.error('Failed to fetch balances:', error);
      setBalance('Error');
      setEthBalance('Error');
    }
  }, [mockUSDC, provider]);

  useEffect(() => {
    if (ethers.utils.isAddress(userAddress)) {
      updateBalances(userAddress);
    }
  }, [userAddress, updateBalances]);

  const claimTokens = async () => {
    if (!ethers.utils.isAddress(userAddress)) {
      setClaimStatus('Please enter a valid EVM compatible wallet address.');
      return;
    }

    try {
      setClaimStatus('Checking balances...');
      const ethBalanceWei = await provider.getBalance(userAddress);
      const ethBalanceEther = ethers.utils.formatEther(ethBalanceWei);

      if (parseFloat(ethBalanceEther) <= 0.0005) {
        setClaimStatus('Claiming ETH...');
        const ethTx = await mockUSDC.claimETH(userAddress);
        await ethTx.wait();
        setClaimStatus('ETH claimed successfully!');
      }

      setClaimStatus('Claiming USDC...');
      const usdcTx = await mockUSDC.claimUSDC(userAddress);
      await usdcTx.wait();

      setClaimStatus('Tokens claimed successfully!');
      await updateBalances(userAddress);
    } catch (error: any) {
      console.error('Failed to claim tokens:', error);
      if (error.error && error.error.reason) {
        if (error.error.reason.includes("USDC claim cooldown period not over")) {
          setClaimStatus('USDC claim cooldown period not over. Please try again later.');
        } else if (error.error.reason.includes("ETH claim cooldown period not over")) {
          setClaimStatus('ETH claim cooldown period not over. Please try again later.');
        } else if (error.error.reason.includes("Insufficient USDC balance")) {
          setClaimStatus('Insufficient USDC balance in the faucet. Please try again later or contact the admin.');
        } else if (error.error.reason.includes("Insufficient ETH balance")) {
          setClaimStatus('Insufficient ETH balance in the faucet. Please try again later or contact the admin.');
        } else {
          setClaimStatus(`Failed to claim tokens: ${error.error.reason}`);
        }
      } else {
        setClaimStatus('Failed to claim tokens. Please try again later.');
      }
    }
  };

  const addTokenToWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
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
    } else {
      console.error('Web3 wallet is not installed');
      setClaimStatus('A Web3 wallet is not detected. Please install a Web3 wallet to add the token to your wallet.');
    }
  };

  const addOrSwitchToBaseSepolia = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // First, try to switch to the network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${baseSepolia.toString(16)}` }],
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${baseSepolia.toString(16)}`,
                chainName: 'Base Sepolia',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia.basescan.org']
              }]
            });
          } catch (addError) {
            console.error('Failed to add Base Sepolia network:', addError);
            setClaimStatus('Failed to add Base Sepolia network. Please try again.');
          }
        } else {
          console.error('Failed to switch to Base Sepolia network:', switchError);
          setClaimStatus('Failed to switch to Base Sepolia network. Please try again.');
        }
      }
    } else {
      console.error('Web3 wallet is not installed');
      setClaimStatus('A Web3 wallet is not detected. Please install a Web3 wallet to add or switch to the Base Sepolia network.');
    }
  };

  return (
    <div className="min-h-screen bg-app-light flex flex-col relative">
      <main className="flex-grow flex flex-col items-center justify-center p-8">
        <img src="/bondi-logo.svg" alt="Bondi Logo" className="mb-8 w-96" />
        <h1 className="text-app-headline-1 text-app-primary-2 mb-8 font-mello">Claim ETH and Mock USDC on Base Sepolia</h1>
        
        <input
          type="text"
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
          placeholder="Enter your Wallet Address"
          className="w-96 px-4 py-2 rounded-lg border border-app-primary-1 mb-4"
        />
        
        <p className="text-app-body-1 text-app-dark mb-4">USDC Balance: {balance} USDC</p>
        <p className="text-app-body-1 text-app-dark mb-4">ETH Balance: {ethBalance} ETH</p>
        
        <button
          onClick={claimTokens}
          className="bg-app-primary-1 text-app-dark px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all duration-300 ease-in-out shadow-md mb-4 text-app-body-1 font-semibold"
        >
          Claim Tokens
        </button>
        
        <button
          onClick={addTokenToWallet}
          className="bg-app-accent text-app-light px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all duration-300 ease-in-out shadow-md text-app-body-1 font-semibold mb-4"
        >
          Add Mock USDC to Wallet
        </button>
        
        <button
          onClick={addOrSwitchToBaseSepolia}
          className="bg-app-primary-2 text-app-light px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all duration-300 ease-in-out shadow-md text-app-body-1 font-semibold mb-4"
        >
          Switch to / Add Base Sepolia Network
        </button>
        
        {claimStatus && (
          <p className="mt-4 text-app-body-2 text-app-dark">{claimStatus}</p>
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
