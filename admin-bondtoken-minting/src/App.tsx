import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import FundingABI from './FundingABI.json';

function App() {
  const [privateKey, setPrivateKey] = useState('');
  const [signer, setSigner] = useState<ethers.Wallet | null>(null);
  const [fundingContracts, setFundingContracts] = useState<{ address: string; name: string }[]>([]);
  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const [minimumInvestmentAmount, setMinimumInvestmentAmount] = useState<string>('');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [fundingPeriodLimit, setFundingPeriodLimit] = useState<string>('');
  const [bondPrice, setBondPrice] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [mode, setMode] = useState<'adjust' | 'mint' | null>(null);

  useEffect(() => {
    const fetchFundingContracts = async () => {
      const contracts = [
        { address: '0x123...', name: 'Funding Contract 1' },
        { address: '0x456...', name: 'Funding Contract 2' },
      ];
      console.log('Fetched contracts:', contracts);
      setFundingContracts(contracts);
    };
    fetchFundingContracts();
  }, []);

  useEffect(() => {
    console.log('Signer state changed:', signer);
  }, [signer]);

  useEffect(() => {
    console.log('Selected contract changed:', selectedContract);
    // Reset all fields when contract selection changes
    setMinimumInvestmentAmount('');
    setTargetAmount('');
    setFundingPeriodLimit('');
    setBondPrice('');
    setMode(null);
    setStatus('');
  }, [selectedContract]);

  const connectWithPrivateKey = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
      const wallet = new ethers.Wallet(privateKey, provider);
      setSigner(wallet);
    } catch (error) {
      console.error('Invalid private key:', error);
      setStatus('Invalid private key. Please try again.');
    }
  };

  const adjustFundingParameters = async () => {
    if (signer && selectedContract) {
      try {
        const contract = new ethers.Contract(selectedContract, FundingABI.abi, signer);
        setStatus('Adjusting funding parameters...');
        
        if (minimumInvestmentAmount) {
          const tx1 = await contract.setMinimumInvestmentAmount(ethers.utils.parseUnits(minimumInvestmentAmount, 6));
          await tx1.wait();
        }
        
        if (targetAmount) {
          const tx2 = await contract.setTargetAmount(ethers.utils.parseUnits(targetAmount, 6));
          await tx2.wait();
        }
        
        if (fundingPeriodLimit) {
          const tx3 = await contract.incrementFundingPeriodLimit(fundingPeriodLimit);
          await tx3.wait();
        }
        
        setStatus('Funding parameters adjusted successfully!');
      } catch (error) {
        console.error('Failed to adjust funding parameters:', error);
        setStatus('Failed to adjust funding parameters. Please try again.');
      }
    }
  };

  const initiateMinting = async () => {
    if (signer && selectedContract && bondPrice) {
      try {
        const contract = new ethers.Contract(selectedContract, FundingABI.abi, signer);
        setStatus('Initiating minting...');
        const tx = await contract.setBondPriceAndInitiateMinting(ethers.utils.parseUnits(bondPrice, 6));
        await tx.wait();
        setStatus('Minting initiated successfully!');
      } catch (error) {
        console.error('Failed to initiate minting:', error);
        setStatus('Failed to initiate minting. Please try again.');
      }
    }
  };

  const goBack = () => {
    setMode(null);
    setStatus('');
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
          <button onClick={connectWithPrivateKey} className="w-full bg-app-primary-2 text-app-light px-4 py-2 rounded hover:bg-opacity-90">
            Connect
          </button>
          <p className="mt-2 text-sm text-app-primary-2">Demo Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80</p>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-4">
          <select
            value={selectedContract || ''}
            onChange={(e) => setSelectedContract(e.target.value)}
            className="w-full p-2 border border-app-primary-2 rounded"
          >
            <option value="">Select Funding Contract</option>
            {fundingContracts.map((contract) => (
              <option key={contract.address} value={contract.address}>{contract.name}</option>
            ))}
          </select>
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
                onChange={(e) => setMinimumInvestmentAmount(e.target.value)}
                placeholder="Minimum Investment Amount"
                className="w-full p-2 border border-app-primary-2 rounded"
              />
              <input
                type="text"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="Target Amount"
                className="w-full p-2 border border-app-primary-2 rounded"
              />
              <input
                type="text"
                value={fundingPeriodLimit}
                onChange={(e) => setFundingPeriodLimit(e.target.value)}
                placeholder="Funding Period Limit (in days)"
                className="w-full p-2 border border-app-primary-2 rounded"
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
                onChange={(e) => setBondPrice(e.target.value)}
                placeholder="Bond Price"
                className="w-full p-2 border border-app-primary-2 rounded"
              />
              <button onClick={initiateMinting} className="w-full bg-app-primary-2 text-app-light px-4 py-2 rounded hover:bg-opacity-90">
                Set Bond Price and Initiate Minting
              </button>
            </>
          )}
          {mode && (
            <button onClick={goBack} className="w-full bg-app-accent text-app-light px-4 py-2 rounded hover:bg-opacity-90">
              Go Back
            </button>
          )}
          {status && <p className="mt-4 text-app-body-2">{status}</p>}
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