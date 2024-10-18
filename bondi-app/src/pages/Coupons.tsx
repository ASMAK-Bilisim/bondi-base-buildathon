import React, { useState, useEffect } from 'react';
import BondCouponTimeline from '../components/Coupons/BondCouponTimeline';
import { usePrimaryMarketBonds } from '../hooks/usePrimaryMarketBonds';
import { useActiveAccount } from 'thirdweb/react';
import { getContract } from 'thirdweb';
import { contractABI } from '../constants/contractInfo';

const Coupons: React.FC = () => {
  const { bonds, isLoading: isBondsLoading, error: bondsError } = usePrimaryMarketBonds();
  const account = useActiveAccount();
  const [investedBonds, setInvestedBonds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvestedBonds = async () => {
      if (!account || isBondsLoading || bondsError || bonds.length === 0) return;

      setIsLoading(true);

      try {
        const investedBondsData = await Promise.all(
          bonds.map(async (bond) => {
            const fundingContract = getContract({
              address: bond.contractAddress,
              abi: contractABI,
            });

            const investedAmountData = await fundingContract.call("investedAmountPerInvestor", account);

            if (investedAmountData && BigInt(investedAmountData.toString()) > BigInt(0)) {
              const investedAmount = Number(investedAmountData.toString()) / 1e6; // Assuming 6 decimals
              return { ...bond, investedAmount };
            } else {
              return null;
            }
          })
        );

        const filteredInvestedBonds = investedBondsData.filter((bond) => bond !== null);

        setInvestedBonds(filteredInvestedBonds);
      } catch (error) {
        console.error('Error fetching invested bonds:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvestedBonds();
  }, [account, bonds, isBondsLoading, bondsError]);

  if (isLoading || isBondsLoading) {
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
