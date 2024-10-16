import React, { useState, useEffect } from 'react';
import BondCouponTimeline from '../components/Coupons/BondCouponTimeline';
import { usePrimaryMarketBonds } from '../hooks/usePrimaryMarketBonds';
import { useAddress, useContract, useContractRead } from "@thirdweb-dev/react";
import { ethers } from 'ethers';
import { contractABI } from '../constants/contractInfo';

const Coupons: React.FC = () => {
  const { bonds, isLoading: isBondsLoading, error: bondsError } = usePrimaryMarketBonds();
  const address = useAddress();
  const [investedBonds, setInvestedBonds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use a single contract instance for all bonds
  const { contract } = useContract(bonds[0]?.contractAddress, contractABI);

  // Use a single useContractRead for all bonds
  const { data: investedAmountsData, isLoading: isInvestedAmountsLoading } = useContractRead(
    contract,
    "investedAmountPerInvestor",
    [address]
  );

  useEffect(() => {
    const fetchInvestedBonds = async () => {
      if (!address || isBondsLoading || bondsError || bonds.length === 0 || isInvestedAmountsLoading || !investedAmountsData) return;

      setIsLoading(true);
      
      const investedBondsData = bonds.filter((bond, index) => {
        const investedAmount = investedAmountsData[index]?.investedAmount;
        return investedAmount && ethers.BigNumber.from(investedAmount).gt(0);
      }).map((bond, index) => {
        const investedAmount = ethers.utils.formatUnits(investedAmountsData[index].investedAmount, 6);
        return { ...bond, investedAmount };
      });

      setInvestedBonds(investedBondsData);
      setIsLoading(false);
    };

    fetchInvestedBonds();
  }, [address, bonds, isBondsLoading, bondsError, investedAmountsData, isInvestedAmountsLoading]);

  if (isLoading || isBondsLoading || isInvestedAmountsLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-app-primary-2"></div>
      </div>
    );
  }

  if (bondsError) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center text-[#1c544e]">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{bondsError.message}</p>
        </div>
      </div>
    );
  }

  if (investedBonds.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center text-[#1c544e]">
          <h2 className="text-2xl font-bold mb-4">No Active Investments</h2>
          <p>You haven't invested in any bonds yet. Visit the Primary Market to start investing!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {investedBonds.map((bond) => (
          <BondCouponTimeline
            key={bond.isin}
            tokenName={`bt${bond.companyName.split(' ')[0].toUpperCase()}`}
            contractAddress={bond.contractAddress}
          />
        ))}
      </div>
    </div>
  );
};

export default Coupons;
