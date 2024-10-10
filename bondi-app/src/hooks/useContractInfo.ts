import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { BOND_CONTRACT_ADDRESS, contractABI, USDC_ADDRESS } from '../constants/contractInfo';
import { useContractRead, useContract, useSDK } from '@thirdweb-dev/react';

const formatNumber = (value: string | number | undefined): string => {
  if (typeof value === 'undefined') return '0';
  if (typeof value === 'string') {
    return value.replace(/[^\d.]/g, '');
  }
  return value.toString();
};

export const useContractInfo = () => {
  const { contract } = useContract(BOND_CONTRACT_ADDRESS, contractABI);
  const { contract: usdcContract } = useContract(USDC_ADDRESS);
  const sdk = useSDK();

  const [contractUSDCBalance, setContractUSDCBalance] = useState("0");
  const [targetAmount, setTargetAmount] = useState("0");
  const [minInvestmentAmount, setMinInvestmentAmount] = useState("0");
  const [contractCreationDate, setContractCreationDate] = useState<Date | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  const { data: contractBalanceData, isLoading: isBalanceLoading, error: balanceError } = useContractRead(
    usdcContract,
    "balanceOf",
    [BOND_CONTRACT_ADDRESS]
  );

  const { data: targetAmountData, isLoading: isTargetLoading, error: targetError } = useContractRead(
    contract,
    "targetAmount"
  );

  const { data: minInvestmentData, isLoading: isMinInvestmentLoading, error: minInvestmentError } = useContractRead(
    contract,
    "minimumInvestmentAmount"
  );

  useEffect(() => {
    const fetchContractCreationDate = async () => {
      if (sdk) {
        try {
          const provider = sdk.getProvider();
          const contractCode = await provider.getCode(BOND_CONTRACT_ADDRESS);
          if (contractCode === '0x') {
            console.error('Contract not found at the specified address');
            return;
          }
          
          const block = await provider.getBlock('latest');
          const currentBlockNumber = block.number;
          
          // Binary search to find the block where the contract was created
          let left = 0;
          let right = currentBlockNumber;
          while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const code = await provider.getCode(BOND_CONTRACT_ADDRESS, mid);
            if (code === '0x') {
              left = mid + 1;
            } else {
              right = mid - 1;
            }
          }
          
          const creationBlock = await provider.getBlock(left);
          const creationDate = new Date(creationBlock.timestamp * 1000);
          setContractCreationDate(creationDate);
          
          // Calculate days remaining
          const now = new Date();
          const endDate = new Date(creationDate.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days after creation
          const timeDiff = endDate.getTime() - now.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
          setDaysRemaining(daysDiff > 0 ? daysDiff : 0);

          console.log('Contract creation date:', creationDate);
          console.log('Days remaining:', daysDiff);
        } catch (error) {
          console.error('Error fetching contract creation date:', error);
        }
      }
    };

    fetchContractCreationDate();
  }, [sdk]);

  useEffect(() => {
    if (contractBalanceData) {
      try {
        const formattedBalance = ethers.utils.formatUnits(formatNumber(contractBalanceData), 6);
        setContractUSDCBalance(formattedBalance);
      } catch (error) {
        console.error('Error formatting contract USDC balance:', error);
      }
    }

    if (targetAmountData) {
      try {
        const formattedTarget = ethers.utils.formatUnits(formatNumber(targetAmountData), 6);
        setTargetAmount(formattedTarget);
      } catch (error) {
        console.error('Error formatting target amount:', error);
      }
    }

    if (minInvestmentData) {
      try {
        const formattedMinInvestment = ethers.utils.formatUnits(formatNumber(minInvestmentData), 6);
        setMinInvestmentAmount(formattedMinInvestment);
      } catch (error) {
        console.error('Error formatting minimum investment amount:', error);
      }
    }
  }, [contractBalanceData, targetAmountData, minInvestmentData]);

  const isLoading = isBalanceLoading || isTargetLoading || isMinInvestmentLoading;
  const error = balanceError || targetError || minInvestmentError;

  return { 
    contractBalance: contractUSDCBalance,
    targetAmount,
    minInvestmentAmount,
    contractCreationDate,
    daysRemaining,
    isLoading,
    error,
    contractAddress: BOND_CONTRACT_ADDRESS  // Add this line
  };
};