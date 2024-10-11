import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ConnectWallet, useAddress } from "@thirdweb-dev/react";
import MockUSDCABI from './MockUSDCABI.json';

function App() {
  const [mockUSDC, setMockUSDC] = useState<ethers.Contract | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [claimStatus, setClaimStatus] = useState<string>('');
  const [isTokenAdded, setIsTokenAdded] = useState(false);

  const address = useAddress();
  const mockUSDCAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

  useEffect(() => {
    if (address) {
      connectToContract();
      setIsTokenAdded(false); // Reset isTokenAdded when address changes
    }
  }, [address]);

  const connectToContract = async () => {
    if (typeof window.ethereum !== 'undefined' && address) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const mockUSDCContract = new ethers.Contract(mockUSDCAddress, MockUSDCABI.abi, signer);
        setMockUSDC(mockUSDCContract);
        await updateBalance(mockUSDCContract, address);
      } catch (error) {
        console.error('Failed to connect to contract:', error);
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

  const claimUSDC = async () => {
    if (mockUSDC && address) {
      try {
        setClaimStatus('Claiming USDC...');
        const tx = await mockUSDC.claim();
        await tx.wait();
        setClaimStatus('USDC claimed successfully!');
        await updateBalance(mockUSDC, address);
      } catch (error) {
        console.error('Failed to claim USDC:', error);
        if (error instanceof Error && error.message.includes('Cooldown period not over')) {
          setClaimStatus('Please wait 10 minutes between claims.');
        } else {
          setClaimStatus('USDC claim failed. Please try again later.');
        }
      }
    }
  };

  const claimETH = async () => {
    // This is a placeholder function. In reality, you would need to implement
    // the logic to claim ETH on the local network.
    setClaimStatus('Claiming ETH...');
    // Simulating a delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setClaimStatus('ETH claimed successfully!');
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
        <h1 className="text-app-headline-1 text-app-primary-2 mb-8 font-mello">Claim ETH gas and Mock USDC</h1>
        {address ? (
          <>
            <p className="text-app-body-1 text-app-dark mb-4">Connected wallet: {address}</p>
            <p className="text-app-body-1 text-app-dark mb-4">Balance: {balance} USDC</p>
            <button
              onClick={claimETH}
              className="bg-app-primary-1 text-app-dark px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all duration-300 ease-in-out shadow-md mb-4 text-app-body-1 font-semibold"
            >
              Claim ETH Gas
            </button>
            <button
              onClick={claimUSDC}
              className="bg-app-primary-2 text-app-light px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all duration-300 ease-in-out shadow-md mb-4 text-app-body-1 font-semibold"
            >
              Claim 100,000 USDC
            </button>
            {claimStatus && <p className="mt-4 text-app-body-2 text-app-dark">{claimStatus}</p>}
            {!isTokenAdded && (
              <button
                onClick={addTokenToWallet}
                className="mt-4 bg-app-accent text-app-light px-6 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-300 ease-in-out shadow-md"
              >
                Add USDC Mock Token
              </button>
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