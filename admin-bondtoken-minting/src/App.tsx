import React, { useState, useEffect } from 'react';
import { ethers, utils } from 'ethers';
import FundingABI from './FundingABI.json';

const ADMIN_PRIVATE_KEY = import.meta.env.VITE_ADMIN_PRIVATE_KEY;
const BASE_SEPOLIA_RPC = import.meta.env.VITE_BASE_SEPOLIA_RPC;
const BASE_SEPOLIA_CHAIN_ID = Number(import.meta.env.VITE_BASE_SEPOLIA_CHAIN_ID);

const FUNDING_CONTRACTS = [
  { address: import.meta.env.VITE_ALPHA_FUNDING_CONTRACT, name: 'Alpha Funding Contract' },
  { address: import.meta.env.VITE_BETA_FUNDING_CONTRACT, name: 'Beta Funding Contract' },
  { address: import.meta.env.VITE_OMEGA_FUNDING_CONTRACT, name: 'Omega Funding Contract' },
];

const formatNumberWithCommas = (value: string) => {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const formatNumberWithCommasAndDecimals = (value: string) => {
  const parts = value.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

const handleNumberInput = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value.replace(/,/g, '');
  if (/^\d*$/.test(value)) {
    setter(formatNumberWithCommas(value));
  }
};

function App() {
  const [privateKey, setPrivateKey] = useState('');
  const [signer, setSigner] = useState<ethers.Wallet | null>(null);
  const [fundingContracts, setFundingContracts] = useState<{ address: string; name: string }[]>([]);
  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const [minimumInvestmentAmount, setMinimumInvestmentAmount] = useState<string>('');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [bondPrice, setBondPrice] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [mode, setMode] = useState<'adjust' | 'mint' | null>(null);
  const [currentMinimumInvestment, setCurrentMinimumInvestment] = useState<string>('');
  const [currentTargetAmount, setCurrentTargetAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setFundingContracts(FUNDING_CONTRACTS);
  }, []);

  useEffect(() => {
    console.log('Signer state changed:', signer);
  }, [signer]);

  const fetchContractValues = async (contractAddress: string) => {
    if (signer) {
      setIsLoading(true);
      const contract = new ethers.Contract(contractAddress, FundingABI.abi, signer);
      try {
        const currentMinimum = await contract.getMinimumInvestmentAmount();
        const currentTarget = await contract.targetAmount();
        setCurrentMinimumInvestment(formatNumberWithCommasAndDecimals(ethers.utils.formatUnits(currentMinimum, 6)));
        setCurrentTargetAmount(formatNumberWithCommasAndDecimals(ethers.utils.formatUnits(currentTarget, 6)));
      } catch (error) {
        console.error('Failed to read contract values:', error);
        setStatus('Failed to read contract values. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    console.log('Selected contract changed:', selectedContract);
    if (selectedContract) {
      fetchContractValues(selectedContract);
    }
    setMinimumInvestmentAmount('');
    setTargetAmount('');
    setBondPrice('');
    setMode(null);
    setStatus('');
  }, [selectedContract, signer]);

  const connectWithPrivateKey = async () => {
    if (privateKey !== ADMIN_PRIVATE_KEY) {
      setStatus('Cannot connect. Invalid private key.');
      return;
    }
    try {
      const provider = new ethers.providers.JsonRpcProvider(BASE_SEPOLIA_RPC, BASE_SEPOLIA_CHAIN_ID);
      await provider.getNetwork(); // This will throw an error if the connection fails
      const wallet = new ethers.Wallet(privateKey, provider);
      setSigner(wallet);
      setStatus('Connected successfully to Base Sepolia!');
    } catch (error) {
      console.error('Error connecting with private key:', error);
      setStatus('Failed to connect to Base Sepolia. Please check your internet connection and try again.');
    }
  };

  const disconnect = () => {
    setSigner(null);
    setPrivateKey('');
    setSelectedContract(null);
    setMinimumInvestmentAmount('');
    setTargetAmount('');
    setBondPrice('');
    setMode(null);
    setStatus('');
  };

  const adjustFundingParameters = async () => {
    if (signer && selectedContract) {
      const contract = new ethers.Contract(selectedContract, FundingABI.abi, signer);
      setStatus('Adjusting funding parameters...');
      setIsLoading(true);

      try {
        let nonce = await signer.getTransactionCount();
        let minimumUpdated = false;
        let targetUpdated = false;
        let statusMessage = '';

        if (minimumInvestmentAmount) {
          const amountWithDecimals = ethers.utils.parseUnits(minimumInvestmentAmount.replace(/,/g, ''), 6);
          const tx = await contract.setMinimumInvestmentAmount(amountWithDecimals, {
            gasLimit: ethers.utils.hexlify(300000),
            maxFeePerGas: ethers.utils.parseUnits('1.5', 'gwei'),
            maxPriorityFeePerGas: ethers.utils.parseUnits('1.5', 'gwei'),
            nonce: nonce++
          });
          await tx.wait();
          minimumUpdated = true;
          statusMessage += 'Minimum investment amount updated successfully. ';
        }

        if (targetAmount) {
          const newTargetAmount = ethers.utils.parseUnits(targetAmount.replace(/,/g, ''), 6);
          const currentTargetAmountBN = ethers.utils.parseUnits(currentTargetAmount.replace(/,/g, ''), 6);

          if (newTargetAmount.lte(currentTargetAmountBN)) {
            statusMessage += 'Error: New target amount must be greater than the current target amount.';
            setStatus(statusMessage);
            if (minimumUpdated) {
              await fetchContractValues(selectedContract);
            }
            setIsLoading(false);
            return;
          }

          const tx = await contract.setTargetAmount(newTargetAmount, {
            gasLimit: ethers.utils.hexlify(300000),
            maxFeePerGas: ethers.utils.parseUnits('1.5', 'gwei'),
            maxPriorityFeePerGas: ethers.utils.parseUnits('1.5', 'gwei'),
            nonce: nonce++
          });
          await tx.wait();
          targetUpdated = true;
          statusMessage += 'Target amount updated successfully. ';
        }

        if (!minimumInvestmentAmount && !targetAmount) {
          statusMessage = 'No parameters to adjust. Please fill at least one field.';
        } else if (minimumUpdated && targetUpdated) {
          statusMessage = 'All specified funding parameters adjusted successfully!';
        } else if (minimumUpdated) {
          statusMessage = 'Minimum investment amount updated successfully. Target amount was not changed.';
        } else if (targetUpdated) {
          statusMessage = 'Target amount updated successfully. Minimum investment amount was not changed.';
        }
        
        setStatus(statusMessage);
        await fetchContractValues(selectedContract);
      } catch (error) {
        console.error('Failed to adjust funding parameters:', error);
        
        let errorMessage = 'An unexpected error occurred. Please try again.';
        
        if (error.message.includes('execution reverted')) {
          errorMessage = 'Transaction was reverted by the contract. Please check your inputs.';
        } else if (error.message.includes('replacement fee too low')) {
          errorMessage = 'Transaction failed due to network congestion. Please try again.';
        }
        
        setStatus(`Failed to adjust funding parameters: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getRevertReason = async (txHash: string, provider: ethers.providers.Provider) => {
    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      console.error('Transaction not found');
      return 'Transaction not found';
    }

    try {
      await provider.call(tx, tx.blockNumber);
      return 'Transaction succeeded';
    } catch (err) {
      if (typeof err === 'object' && err !== null) {
        if ('data' in err) {
          const result = err.data;
          if (typeof result === 'string') {
            // It's a revert reason string
            return ethers.utils.toUtf8String('0x' + result.slice(138));
          }
        } else if ('message' in err) {
          const match = err.message.match(/execution reverted: (.*)/);
          if (match) {
            return match[1];
          }
        }
      }
      return 'Unknown error';
    }
  };

  const initiateMinting = async () => {
    if (signer && selectedContract && bondPrice) {
      try {
        const contract = new ethers.Contract(selectedContract, FundingABI.abi, signer);
        setStatus('Initiating minting...');
        const priceWithDecimals = ethers.utils.parseUnits(bondPrice.replace(/,/g, ''), 6);

        const tx = await contract.setBondPriceAndInitiateMinting(priceWithDecimals);
        await tx.wait();

        setStatus('Minting initiated successfully!');
      } catch (error) {
        console.error('Failed to initiate minting:', error);
        
        let errorMessage = 'An unexpected error occurred. Please try again.';
        
        if (error.message) {
          if (error.message.includes('Bond price already set')) {
            errorMessage = 'Bond price already set';
          } else if (error.message.includes('Target amount not reached')) {
            errorMessage = 'Target amount not reached';
          } else if (error.message.includes('Funding period has ended')) {
            errorMessage = 'Funding period has ended';
          } else if (error.message.includes('execution reverted:')) {
            // Extract the exact revert reason
            const match = error.message.match(/execution reverted: (.*?)"/);
            if (match && match[1]) {
              errorMessage = match[1];
            }
          }
        }
        
        setStatus(`Failed to initiate minting: ${errorMessage}`);
      }
    }
  };

  const goBack = () => {
    setMode(null);
    setStatus('');
  };

  const handleContractChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newContract = e.target.value;
    setSelectedContract(newContract);
    if (newContract) {
      setCurrentMinimumInvestment('');
      setCurrentTargetAmount('');
      fetchContractValues(newContract);
    }
  };

  return (
    <div className="min-h-screen bg-app-light flex flex-col items-center justify-center p-4 relative">
      <img src="/bondi-logo.svg" alt="Bondi Logo" className="mb-8 w-96" />
      <h1 className="text-app-headline-1 text-app-primary-2 mb-8">Admin Bond Token Minting</h1>
      {!signer ? (
        <div className="w-full max-w-md">
          <input
            type="password"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder="Enter Private Key"
            className="w-full p-2 border border-app-primary-2 rounded mb-2"
          />
          <button onClick={connectWithPrivateKey} className="w-full bg-app-primary-2 text-app-light px-4 py-2 rounded hover:bg-opacity-90 mb-4">
            Connect
          </button>
          {status && (
            <p className="mt-2 text-app-body-2 mb-4">{status}</p>
          )}
          <div className="bg-app-accent bg-opacity-10 p-4 rounded-lg text-xs text-app-primary-2 break-words">
            <p className="font-bold mb-2">Disclaimer:</p>
            <p className="mb-2">This is a demo: Wallet with private key 531e96f15be337b94df3f39d961f032fe8deee0c8e9000ff700ea1308a8ff936 is the deployer of smart contracts and it has the sole authority to manage funding contracts and mint bonds upon real life purchase.</p>
            <p>The real product will have multisigs with different authorities for different tasks. Preliminary implementation can be seen on codebase and explained in README.md</p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-4">
          <select
            value={selectedContract || ''}
            onChange={handleContractChange}
            className="w-full p-2 border border-app-primary-2 rounded"
          >
            <option value="">Select Funding Contract</option>
            {fundingContracts.map((contract) => (
              <option key={contract.address} value={contract.address}>{contract.name}</option>
            ))}
          </select>
          {selectedContract && (
            <div className="w-full mb-4">
              {isLoading ? (
                <p className="text-app-primary-2">Loading contract data...</p>
              ) : (
                <>
                  <p className="text-app-primary-2">Current Minimum Investment: {currentMinimumInvestment} USDC</p>
                  <p className="text-app-primary-2">Current Target Amount: {currentTargetAmount} USDC</p>
                </>
              )}
            </div>
          )}
          {selectedContract && !mode && (
            <div className="space-y-2">
              <button onClick={() => setMode('adjust')} className="w-full bg-app-primary-2 text-app-light px-4 py-2 rounded hover:bg-opacity-90">
                Adjust Funding Contract Parameters
              </button>
              <button onClick={() => setMode('mint')} className="w-full bg-app-primary-2 text-app-light px-4 py-2 rounded hover:bg-opacity-90">
                Mint Bond Tokens
              </button>
            </div>
          )}
          {mode === 'adjust' && (
            <>
              <input
                type="text"
                value={minimumInvestmentAmount}
                onChange={handleNumberInput(setMinimumInvestmentAmount)}
                placeholder="New Minimum Investment Amount"
                className="w-full p-2 border border-app-primary-2 rounded mb-2"
              />
              <input
                type="text"
                value={targetAmount}
                onChange={handleNumberInput(setTargetAmount)}
                placeholder="New Target Amount"
                className="w-full p-2 border border-app-primary-2 rounded mb-2"
              />
              <button onClick={adjustFundingParameters} className="w-full bg-app-primary-2 text-app-light px-4 py-2 rounded hover:bg-opacity-90">
                Adjust Parameters
              </button>
            </>
          )}
          {mode === 'mint' && (
            <>
              <input
                type="text"
                value={bondPrice}
                onChange={handleNumberInput(setBondPrice)}
                placeholder="Bond Price (in USDC)"
                className="w-full p-2 border border-app-primary-2 rounded"
              />
              <button onClick={initiateMinting} className="w-full bg-app-primary-2 text-app-light px-4 py-2 rounded hover:bg-opacity-90">
                Set Bond Price and Initiate Minting
              </button>
            </>
          )}
          {status && <p className="mt-4 text-app-body-2">{status}</p>}
          <button 
            onClick={mode ? goBack : disconnect} 
            className="w-full bg-app-accent text-app-light px-4 py-2 rounded hover:bg-opacity-90"
          >
            {mode ? "Go Back" : "Disconnect"}
          </button>
        </div>
      )}
      
      <img 
        src="/mascot.svg" 
        alt="Bondi Mascot" 
        className="absolute bottom-4 right-4 w-48 h-48" 
      />
    </div>
  );
}

export default App;