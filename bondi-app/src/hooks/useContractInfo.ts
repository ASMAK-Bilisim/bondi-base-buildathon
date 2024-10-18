import { useState, useEffect, useCallback } from 'react';
import { contractABI, MOCK_USDC_ADDRESS, mockUsdcABI, CDS_MANAGER_ADDRESS, cdsManagerABI } from '../constants/contractInfo';
import { useReadContract } from 'thirdweb/react';
import { getContract } from 'thirdweb';
import { client } from '../client';
import { baseSepolia } from 'thirdweb/chains';

export const useContractInfo = (contractAddress: string) => {
  const [contractUSDCBalance, setContractUSDCBalance] = useState("0");
  const [targetAmount, setTargetAmount] = useState("0");
  const [minInvestmentAmount, setMinInvestmentAmount] = useState("0");
  const [contractCreationDate, setContractCreationDate] = useState<Date | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [whaleNftAddress, setWhaleNftAddress] = useState<string>('');
  
  const usdcContract = getContract({
    client,
    address: MOCK_USDC_ADDRESS,
    chain: baseSepolia,
    abi: mockUsdcABI,
  });

  const fundingContract = getContract({
    client,
    address: contractAddress,
    chain: baseSepolia,
    abi: contractABI,
  });

  const cdsManagerContract = getContract({
    client,
    address: CDS_MANAGER_ADDRESS,
    chain: baseSepolia,
    abi: cdsManagerABI as const, 
  });

  const fetchCDSOffers = useCallback(
    async (bondHash: string) => {
      if (!cdsManagerContract) return [];

      try {
        const cdsCountResult = await cdsManagerContract.readContract({
          functionName: 'cdsCount',
        });
        const totalCDS = Number(cdsCountResult);
        const offers = [];

        for (let i = 0; i < totalCDS; i++) {
          try {
            const cdsData: any = await cdsManagerContract.readContract({
              functionName: 'cds',
              args: [BigInt(i)],
            });
            // cdsData: [cdsID, creator, buyer, bondAddressAndExpiration, premium, isActive]

            if (
              cdsData &&
              cdsData[3] === bondHash &&
              cdsData[5] && // isActive
              cdsData[2] === '0x0000000000000000000000000000000000000000' // buyer is zero address
            ) {
              offers.push({
                cdsID: cdsData[0],
                creator: cdsData[1],
                buyer: cdsData[2],
                bondAddressAndExpiration: cdsData[3],
                premium: cdsData[4],
                isActive: cdsData[5],
              });
            }
          } catch (error) {
            console.error(`Error fetching CDS data for ID ${i}:`, error);
          }
        }

        return offers;
      } catch (error) {
        console.error('Error fetching CDS offers:', error);
        return [];
      }
    },
    [cdsManagerContract],
  );

  const { data: contractBalanceData, isLoading: isBalanceLoading, error: balanceError } = useReadContract({
    contract: usdcContract,
    method: "balanceOf",
    params: [contractAddress],
  });

  const { data: targetAmountData, isLoading: isTargetLoading, error: targetError } = useReadContract({
    contract: fundingContract,
    method: "targetAmount",
    params: [contractAddress],
  });

  const { data: minInvestmentData, isLoading: isMinInvestmentLoading, error: minInvestmentError } = useReadContract({
    contract: fundingContract,
    method: "getMinimumInvestmentAmount",
    params: [contractAddress],
  });

  const { data: bondTokenAddressData } = useReadContract({
    contract: fundingContract,
    method: "bondDistribution",
    params: [contractAddress],
  });

  const { data: ogNFTAddressData } = useReadContract({
    contract: fundingContract,
    method: "ogNFT",
    params: [contractAddress],
  });

  const { data: whaleNFTAddressData } = useReadContract({
    contract: fundingContract,
    method: "whaleNFT",
    params: [contractAddress],
  });

  useEffect(() => {
    const fetchContractCreationDate = async () => {
      try {
        // This is a placeholder. Replace with actual contract creation date fetching logic
        const creationDate = new Date();
        setContractCreationDate(creationDate);
        
        const now = new Date();
        const endDate = new Date(creationDate.getTime() + 90 * 24 * 60 * 60 * 1000);
        const timeDiff = endDate.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        setDaysRemaining(Math.max(daysDiff, 0));
      } catch (error) {
        console.error('Error fetching contract creation date:', error);
      }
    };

    fetchContractCreationDate();
  }, [contractAddress]);

  useEffect(() => {
    if (contractBalanceData) setContractUSDCBalance((Number(contractBalanceData) / 1e6).toFixed(2));
    if (targetAmountData) setTargetAmount((Number(targetAmountData) / 1e6).toFixed(2));
    if (minInvestmentData) setMinInvestmentAmount((Number(minInvestmentData) / 1e6).toFixed(2));
    if (whaleNFTAddressData) setWhaleNftAddress(whaleNFTAddressData as string);
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
    whaleNftAddress,
    usdcContract,
    fundingContract,
    cdsManagerContract,
    fetchCDSOffers,
  };
};
