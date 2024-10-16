import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractABI, MOCK_USDC_ADDRESS } from '../constants/contractInfo';
import { useContractRead, useContract, useSDK } from '@thirdweb-dev/react';

const formatNumber = (value: string | number | undefined): string => {
  if (typeof value === 'undefined') return '0';
  if (typeof value === 'string') {
    return value.replace(/[^\d.]/g, '');
  }
  return value.toString();
};

export const useContractInfo = (contractAddress: string) => {
  const { contract } = useContract(contractAddress, contractABI);
  const { contract: usdcContract } = useContract(MOCK_USDC_ADDRESS);
  const sdk = useSDK();

  const [contractUSDCBalance, setContractUSDCBalance] = useState("0");
  const [targetAmount, setTargetAmount] = useState("0");
  const [minInvestmentAmount, setMinInvestmentAmount] = useState("0");
  const [contractCreationDate, setContractCreationDate] = useState<Date | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [whaleNftAddress, setWhaleNftAddress] = useState<string>('');
  
  const { data: contractBalanceData, isLoading: isBalanceLoading, error: balanceError } = useContractRead(
    usdcContract,
    "balanceOf",
    [contractAddress]
  );

  const { data: targetAmountData, isLoading: isTargetLoading, error: targetError } = useContractRead(
    contract,
    "targetAmount"
  );

  const { data: minInvestmentData, isLoading: isMinInvestmentLoading, error: minInvestmentError } = useContractRead(
    contract,
    "getMinimumInvestmentAmount"
  );

  const { data: bondTokenAddressData } = useContractRead(contract, "bondDistribution");
  const { data: ogNFTAddressData } = useContractRead(contract, "ogNFT");
  const { data: whaleNFTAddressData } = useContractRead(contract, "whaleNFT"); // Fetching whaleNFT

  useEffect(() => {
    const fetchContractCreationDate = async () => {
      if (sdk) {
        try {
          const provider = sdk.getProvider();
          const contractCode = await provider.getCode(contractAddress);
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
            const code = await provider.getCode(contractAddress, mid);
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
  }, [sdk, contractAddress]);

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

    if (whaleNFTAddressData) {
      setWhaleNftAddress(whaleNFTAddressData);
    }
  }, [contractBalanceData, targetAmountData, minInvestmentData, whaleNFTAddressData]);

  const isLoading = isBalanceLoading || isTargetLoading || isMinInvestmentLoading;
  const errorCombined = balanceError || targetError || minInvestmentError;

  return { 
    contractBalance: contractUSDCBalance,
    targetAmount,
    minInvestmentAmount,
    contractCreationDate,
    daysRemaining,
    isLoading,
    error: errorCombined,
    contractAddress,
    mockUsdcAddress: MOCK_USDC_ADDRESS,
    bondTokenAddress: bondTokenAddressData,
    ogNftAddress: ogNFTAddressData,
    whaleNftAddress, // Included whaleNftAddress in return
  };
};
