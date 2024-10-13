import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { ConnectWallet, useAddress, useNetwork, useNetworkMismatch } from "@thirdweb-dev/react";
import MockUSDCABI from './MockUSDCABI.json';

// Replace these lines at the top of your file
const FAUCET_PRIVATE_KEY = import.meta.env.VITE_FAUCET_PRIVATE_KEY;
const mockUSDCAddress = import.meta.env.VITE_MOCK_USDC_ADDRESS;
const baseSepolia = parseInt(import.meta.env.VITE_BASE_SEPOLIA_CHAIN_ID);

function App() {
  const [mockUSDC, setMockUSDC] = useState<ethers.Contract | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [claimStatus, setClaimStatus] = useState<string>('');
  const [isTokenAdded, setIsTokenAdded] = useState(false);
  const [network, switchNetwork] = useNetwork();
  const isMismatched = useNetworkMismatch();
  const [isBaseSepolia, setIsBaseSepolia] = useState(false);
  const claimStatusRef = useRef<string>('');
  const [, forceUpdate] = useState({});

  const address = useAddress();
  
  useEffect(() => {
    if (address) {
      checkNetwork();
    }
  }, [address, network]); // Add network to the dependency array

  const checkNetwork = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        const isCorrectNetwork = network.chainId === baseSepolia;
        setIsBaseSepolia(isCorrectNetwork);
        if (isCorrectNetwork) {
          connectToContract();
        } else {
          setMockUSDC(null);
          setBalance('0');
          updateClaimStatus(''); // Clear claim status when not on Base Sepolia
        }
      } catch (error) {
        console.error('Failed to check network:', error);
        setIsBaseSepolia(false);
        updateClaimStatus('Failed to check network');
      }
    }
  };

  const connectToContract = async () => {
    if (typeof window.ethereum !== 'undefined' && address) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const mockUSDCContract = new ethers.Contract(mockUSDCAddress, MockUSDCABI.abi, signer);
        console.log('MockUSDC contract instance created');
        setMockUSDC(mockUSDCContract);
        await updateBalance(mockUSDCContract, address);
      } catch (error) {
        console.error('Failed to connect to contract:', error);
        setClaimStatus('Failed to connect to contract');
      }
    }
  };

  const updateBalance = useCallback(async (contract: ethers.Contract, walletAddress: string) => {
    try {
      const balance = await contract.balanceOf(walletAddress);
      const formattedBalance = ethers.utils.formatUnits(balance, 6);
      setBalance(Number(formattedBalance).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalance('Error');
    }
  }, []);

  const updateClaimStatus = (status: string) => {
    claimStatusRef.current = status;
    forceUpdate({});
  };

  const claimETH = async () => {
    if (mockUSDC && address) {
      try {
        updateClaimStatus('Claiming ETH...');
        console.log('Attempting to claim ETH for address:', address);

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const faucetWallet = new ethers.Wallet(FAUCET_PRIVATE_KEY, provider);
        const faucetMockUSDC = new ethers.Contract(mockUSDCAddress, MockUSDCABI.abi, faucetWallet);

        const tx = await faucetMockUSDC.claimETH(address);
        updateClaimStatus('ETH claim transaction sent. Waiting for confirmation...');
        await tx.wait();
        
        updateClaimStatus('ETH claimed successfully!');
        await updateBalance(mockUSDC, address);
      } catch (error) {
        console.error('Failed to claim ETH:', error);
        handleClaimError(error, 'ETH');
      }
    } else {
      updateClaimStatus('Unable to claim ETH. Please make sure you are connected to the correct network.');
    }
  };

  const claimUSDCAndAddToken = async () => {
    if (mockUSDC && address) {
      try {
        updateClaimStatus('Claiming USDC...');
        console.log('Attempting to claim USDC');
        
        const tx = await mockUSDC.claimUSDC({ gasLimit: 200000 });
        updateClaimStatus('USDC claim transaction sent. Waiting for confirmation...');
        await tx.wait();
        
        updateClaimStatus('USDC claimed successfully!');
        await updateBalance(mockUSDC, address);
        await addTokenToWallet();
      } catch (error) {
        console.error('Failed to claim USDC or add token:', error);
        handleClaimError(error, 'USDC');
      }
    } else {
      updateClaimStatus('Unable to claim USDC. Please make sure you are connected to the correct network.');
    }
  };

  const handleClaimError = (error: any, tokenType: string) => {
    if (error.code === 'ACTION_REJECTED') {
      updateClaimStatus(`${tokenType} claim cancelled. You rejected the transaction.`);
    } else if (error.message.includes('Cooldown period not over')) {
      updateClaimStatus(`Please wait before claiming ${tokenType} again.`);
    } else if (error.message.includes('Insufficient ETH balance in contract')) {
      updateClaimStatus(`${tokenType} faucet is currently empty. Please try again later or contact the admin.`);
    } else if (error.message.includes('ETH transfer failed')) {
      updateClaimStatus(`Failed to transfer ${tokenType}. There is a cooldown period of 10 minutes. Please try again later.`);
    } else {
      updateClaimStatus(`Failed to claim ${tokenType}. There is a cooldown period of 10 minutes. Please try again later.`);
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
        await switchNetwork(baseSepolia);
        // After switching, check the network again
        await checkNetwork();
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
            {isBaseSepolia ? (
              <>
                <button
                  onClick={addTokenToWallet}
                  className="bg-app-accent text-app-light px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all duration-300 ease-in-out shadow-md text-app-body-1 font-semibold mb-4"
                >
                  Add Mock USDC to Wallet
                </button>
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
              </>
            ) : (
              <div className="mb-6 text-center">
                <button
                  onClick={switchToBaseSepolia}
                  className="bg-app-accent text-app-light px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all duration-300 ease-in-out shadow-md text-app-body-1 font-semibold mb-2"
                >
                  Switch to Base Sepolia
                </button>
                <p className="text-red-600 font-bold text-lg animate-bounce mt-2">
                  Please switch to Base Sepolia network to continue
                </p>
              </div>
            )}
            {isBaseSepolia && claimStatusRef.current && (
              <p className="mt-4 text-app-body-2 text-app-dark">{claimStatusRef.current}</p>
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
