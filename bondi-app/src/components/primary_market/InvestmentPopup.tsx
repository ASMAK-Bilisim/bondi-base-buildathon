import React, { useState, useEffect } from 'react';
import { CancelSquareIcon, Exchange01Icon, SquareLock01Icon, SquareUnlock01Icon } from "@hugeicons/react";
import { useAddress, useContract, useContractRead, useContractWrite, useSDK } from "@thirdweb-dev/react";
import { ethers } from 'ethers';
import { USDC_ADDRESS, BOND_CONTRACT_ADDRESS, contractABI } from '../../constants/contractInfo';
import { useContractInfo } from '../../hooks/useContractInfo';
import { useNavigate } from 'react-router-dom';
import 'react-circular-progressbar/dist/styles.css';

interface InvestmentPopupProps {
  onClose: () => void;
  bondData: {
    companyName: string;
    companyLogo: string;
    bondYield: number;
    maturityDate: string;
    currentPrice: number;
    isin: string;
  };
}

const InvestmentPopup: React.FC<InvestmentPopupProps> = ({ onClose, bondData }) => {
  const [amount, setAmount] = useState<string>('0.0000');
  const [isUSDC, setIsUSDC] = useState<boolean>(true);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [userBalance, setUserBalance] = useState<string>('0.00');
  const [investedAmount, setInvestedAmount] = useState<string>('0.00');
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isInvesting, setIsInvesting] = useState(false);
  const [isInvestmentComplete, setIsInvestmentComplete] = useState(false);
  const [isOGNFTUnlocked, setIsOGNFTUnlocked] = useState(false);
  const [isWhaleNFTUnlocked, setIsWhaleNFTUnlocked] = useState(false);

  const address = useAddress();
  const sdk = useSDK();
  const { contract: usdcContract } = useContract(USDC_ADDRESS);
  const { contract: bondContract } = useContract(BOND_CONTRACT_ADDRESS, contractABI);
  const { minInvestmentAmount, targetAmount, isLoading: isContractInfoLoading } = useContractInfo();

  const { data: balanceData, isLoading: isBalanceLoading } = useContractRead(
    usdcContract,
    "balanceOf",
    [address]
  );

  const { data: allowanceData, isLoading: isAllowanceLoading, refetch: refetchAllowance } = useContractRead(
    usdcContract,
    "allowance",
    [address, BOND_CONTRACT_ADDRESS]
  );

  const { data: investedAmountData, isLoading: isInvestedAmountLoading, refetch: refetchInvestedAmount } = useContractRead(
    bondContract,
    "investedAmountPerInvestor",
    [address]
  );

  const { mutateAsync: approveUSDC, isLoading: isApproveLoading } = useContractWrite(usdcContract, "approve");
  const { mutateAsync: invest, isLoading: isInvestLoading } = useContractWrite(bondContract, "invest");

  const navigate = useNavigate();

  // Effect to refetch invested amount on component mount and address change
  useEffect(() => {
    if (address) {
      refetchInvestedAmount();
    }
  }, [address, refetchInvestedAmount]);

  useEffect(() => {
    if (allowanceData && !isAllowanceLoading) {
      const allowance = ethers.BigNumber.from(allowanceData);
      setIsApproved(allowance.gt(ethers.constants.Zero));
    }
  }, [allowanceData, isAllowanceLoading]);

  useEffect(() => {
    if (balanceData) {
      const formattedBalance = ethers.utils.formatUnits(balanceData.toString(), 6);
      setUserBalance(formattedBalance);
    }
  }, [balanceData]);

  useEffect(() => {
    if (investedAmountData) {
      const formattedInvestedAmount = ethers.utils.formatUnits(investedAmountData.investedAmount.toString(), 6);
      setInvestedAmount(formattedInvestedAmount);
    }
  }, [investedAmountData]);

  useEffect(() => {
    if (isInvestmentComplete) {
      setIsOGNFTUnlocked(true);
      const whaleThreshold = parseFloat(targetAmount) * 0.025;
      setIsWhaleNFTUnlocked(parseFloat(amount) >= whaleThreshold);
    }
  }, [isInvestmentComplete, amount, targetAmount]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(value);
  };

  const formatNumber = (value: number): string => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 1) {
      parts[1] = parts[1].slice(0, 4); // Limit to 4 decimal places
    }
    setAmount(parts.join('.'));
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (amount === '0.0000') {
      setAmount('');
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    if (amount === '' || parseFloat(amount) === 0) {
      setAmount('0.0000');
    } else {
      // Ensure 4 decimal places are always shown
      setAmount(parseFloat(amount).toFixed(4));
    }
  };

  const handleMaxClick = () => {
    if (isUSDC) {
      setAmount(parseFloat(userBalance).toFixed(4));
    } else {
      setAmount((parseFloat(userBalance) / bondData.currentPrice).toFixed(4));
    }
  };

  const toggleCurrency = () => {
    setIsUSDC(!isUSDC);
    if (amount !== '0.0000' && amount !== '') {
      if (isUSDC) {
        setAmount((parseFloat(amount) / bondData.currentPrice).toFixed(4));
      } else {
        setAmount((parseFloat(amount) * bondData.currentPrice).toFixed(4));
      }
    }
  };

  const calculateEquivalent = (): string => {
    const value = parseFloat(amount) || 0;
    if (isUSDC) {
      return `${formatNumber(value / bondData.currentPrice)} ${bondTokenName}`;
    } else {
      return `${formatNumber(value * bondData.currentPrice)} USDC`;
    }
  };

  // Get the first word of the company name for the bond token representation
  const bondTokenName = `bt${bondData.companyName.split(' ')[0].toUpperCase()}`;

  // Get today's date
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });

  const handleApprove = async () => {
    if (!address) return;
    setIsApproving(true);
    try {
      const maxUint256 = ethers.constants.MaxUint256;
      await approveUSDC({ args: [BOND_CONTRACT_ADDRESS, maxUint256] });
      await refetchAllowance();
      setIsApproved(true);
    } catch (error) {
      console.error("Error approving USDC:", error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleInvest = async () => {
    if (!address || !sdk) return;
    setIsInvesting(true);
    try {
      const amountToInvest = ethers.utils.parseUnits(amount, 6);
      
      // Check if approval is needed
      if (!isApproved) {
        await handleApprove();
      }

      // Now, call the invest function on the bond contract
      const investTx = await invest({ args: [amountToInvest] });

      // Wait for the transaction to be mined
      await sdk.getProvider().waitForTransaction(investTx.receipt.transactionHash);

      console.log("Investment successful:", investTx);

      // After successful investment, refetch the invested amount
      await refetchInvestedAmount();

      setIsInvestmentComplete(true);
    } catch (error) {
      console.error("Error investing:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsInvesting(false);
    }
  };

  const handleGoHome = () => {
    onClose();
    navigate('/'); // Assuming '/' is your home route
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-[#F2FBF9] rounded-xl w-full max-w-5xl h-[95vh] relative flex flex-col overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#1C544E] hover:text-[#3EBAAD] transition-colors z-10"
        >
          <CancelSquareIcon 
            size={34}
            variant="solid"
            className="transition-colors duration-200"
            color="currentColor"
          />
        </button>

        <div className="flex h-full relative">
          {/* Left Panel */}
          <div className="w-1/2 overflow-y-auto relative">
            {isInvestmentComplete ? (
              <div className="bg-[#071f1e] h-full flex flex-col items-center justify-center relative overflow-hidden">
                {/* Updated convexical glow effect */}
                <div 
                  className="absolute top-0 left-0 right-0 h-60 opacity-20"
                  style={{
                    background: 'radial-gradient(ellipse at top, #d8feaa 0%, rgba(216, 254, 170, 0) 70%)',
                    transform: 'scaleY(0.7)',
                    transformOrigin: 'top'
                  }}
                ></div>
                
                <div className="flex flex-col items-start space-y-12 p-8 relative z-10">
                  <div className="flex items-center">
                    <div className="w-16">
                      {isOGNFTUnlocked ? (
                        <SquareUnlock01Icon size={64} color="#d8feaa" variant="solid" />
                      ) : (
                        <SquareLock01Icon size={64} color="#f2fbf9" variant="solid" />
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-[#f2fbf9] text-[22px] font-bold">OG NFT</h3>
                      <p className="text-[#f2fbf9] text-[14px] mt-1 opacity-70">Participate in the first funding phase</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-16">
                      {isWhaleNFTUnlocked ? (
                        <SquareUnlock01Icon size={64} color="#d8feaa" variant="solid" />
                      ) : (
                        <SquareLock01Icon size={64} color="#f2fbf9" variant="solid" />
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-[#f2fbf9] text-[22px] font-bold">Whale NFT</h3>
                      <p className="text-[#f2fbf9] text-[14px] mt-1 opacity-70">Commit at least $5,000</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Original left panel content
              <div className="h-full flex flex-col justify-center p-8">
                <div className="mb-4">
                  <img src={bondData.companyLogo} alt={`${bondData.companyName} logo`} className="w-14 h-14" />
                </div>
                <h2 className="text-[#1C544E] text-[26px] font-medium">Invest in</h2>
                <h1 className="text-[#1C544E] text-[26px] font-bold mb-8">{bondTokenName}</h1>
                
                <div className="space-y-2 text-sm text-[#1C544E]">
                  <div className="flex justify-between">
                    <span>Bond Price:</span>
                    <span>{formatCurrency(bondData.currentPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maturity Date:</span>
                    <span>{bondData.maturityDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Yield to Maturity:</span>
                    <span>{bondData.bondYield}%</span>
                  </div>
                </div>

                <h3 className="mt-8 mb-4 text-[#1C544E] text-base font-bold">Commitment Terms</h3>
                <ol className="list-decimal list-inside space-y-4 text-xs text-[#1C544E]">
                  <li>The first funding phase features the initial commitment period. During this period, you can join the funding phase by putting 10% of your total investment.</li>
                  <li>When the commitments reach 10% of the target investment amount, the funding phase proceeds to the pending payment phase, where users have two weeks to pay the remaining 90% of their investments.</li>
                  <li>If the target investment amount is not reached before the two-week deadline, funding phase is cancelled and user funds are refunded.</li>
                </ol>
              </div>
            )}
          </div>

          {/* Middle line with shadow effect only to the left */}
          {!isInvestmentComplete && (
            <div className="absolute top-0 bottom-0 right-1/2 w-6 pointer-events-none">
              <div className="absolute top-0 bottom-0 w-6 bg-gradient-to-l from-[#E0E0E0] to-transparent opacity-30"></div>
            </div>
          )}

          {/* Right Panel */}
          <div className="w-1/2 p-8 overflow-y-auto flex flex-col">
            {isInvestmentComplete ? (
              <div className="flex-grow flex flex-col justify-between items-center text-center">
                <div className="w-full">
                  <h2 className="text-[22px] font-bold text-[#1C544E] mb-16">Congratulations!</h2>
                  <div className="space-y-6">
                    <p className="text-lg text-[#1C544E]">
                      Thank you for committing your investment in the {bondTokenName} funding phase!
                    </p>
                    <p className="text-md text-[#1C544E]">
                      As a participant in Bondi's inaugural funding round, you've earned the exclusive OG NFT and secured your allocation for the upcoming Bondi protocol token.
                    </p>
                    <p className="text-md text-[#1C544E]">
                      Once the target amount is reached, you'll be able to claim your Bond Tokens.
                    </p>
                  </div>
                </div>
                <div className="w-full px-16">
                  <button 
                    onClick={handleGoHome}
                    className="w-full bg-[#1C544E] text-white text-xl font-medium py-4 rounded-xl hover:bg-[#164039] transition-colors duration-300"
                  >
                    Go Home
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-grow flex flex-col justify-center">
                  <div className="mb-2">
                    <div className="flex justify-between items-end mb-2">
                      <label htmlFor="amount" className="text-[24px] font-medium text-[#1C544E]">
                        Amount
                      </label>
                      <div className="text-right">
                        <p className="text-[#1C544E] text-xs mb-1">{today}</p>
                        <p className="text-[#1C544E] text-sm font-bold">
                          1 {bondTokenName} = {formatCurrency(bondData.currentPrice)}
                        </p>
                      </div>
                    </div>
                    <div className="relative mt-2">
                      <input
                        type="text"
                        id="amount"
                        value={isFocused ? amount : `${amount} ${isUSDC ? 'USDC' : bondTokenName}`}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className="w-full p-4 border border-[#1C544E] rounded-xl text-xl font-bold text-[#1C544E] opacity-70"
                      />
                      <button
                        onClick={toggleCurrency}
                        className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-[#D4E7E2] text-[#1C544E] p-2 rounded-xl hover:bg-[#B3D1C8] transition-colors duration-300"
                      >
                        <Exchange01Icon 
                          size={24} 
                          className="transition-transform duration-300 hover:rotate-180"
                        />
                      </button>
                      <button
                        onClick={handleMaxClick}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#D4E7E2] text-[#1C544E] px-4 py-2 rounded-xl font-bold hover:bg-[#B3D1C8] transition-colors duration-300"
                      >
                        Max
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-[#1C544E] opacity-60 mb-8">{calculateEquivalent()}</p>

                  <div className="space-y-4 text-xs text-[#1C544E] mb-8">
                    <div className="flex justify-between">
                      <span>Minimum Investment:</span>
                      <span>
                        {isContractInfoLoading 
                          ? 'Loading...' 
                          : `${formatCurrency(parseFloat(minInvestmentAmount))} USDC`
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Your Balance:</span>
                      <div className="text-right">
                        <p className="font-bold">
                          {isBalanceLoading ? 'Loading...' : `${formatCurrency(parseFloat(userBalance))} USDC`}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Already Invested:</span>
                      <div className="text-right">
                        <p className="font-bold">
                          {isInvestedAmountLoading ? 'Loading...' : `${formatCurrency(parseFloat(investedAmount))} USDC`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <p className="text-[9px] text-[#1C544E] mb-4">
                    Please note that the price and Yield to Maturity (YTM) indicated during the Funding Phase are provisional and do not represent the final figures. Once the bonds are purchased in real life, you will be notified, and the realized price and YTM will be displayed when you mint your bond tokens.
                  </p>

                  <button 
                    onClick={isApproved ? handleInvest : handleApprove}
                    disabled={isApproving || isApproveLoading || isInvesting || isInvestLoading}
                    className="w-full bg-[#1C544E] text-white text-xl font-medium py-4 rounded-xl hover:bg-[#164039] transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isApproving || isApproveLoading 
                      ? 'Approving...' 
                      : isInvesting || isInvestLoading 
                        ? 'Investing...' 
                        : isApproved 
                          ? 'Invest' 
                          : 'Approve USDC'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentPopup;