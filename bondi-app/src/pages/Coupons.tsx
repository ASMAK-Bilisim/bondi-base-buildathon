import React, { useState, useEffect } from 'react';
import BondCouponTimeline from '../components/Coupons/BondCouponTimeline';
import { useActiveAccount } from 'thirdweb/react';
import { getContract, readContract } from 'thirdweb';
import { client } from '../client';
import { baseSepolia } from 'thirdweb/chains';
import { contractABI } from '../constants/contractInfo';
import { usePrimaryMarketBonds } from '../hooks/usePrimaryMarketBonds';

interface Coupon {
  id: string;
  date: Date;
  amount: number;
  isRedeemable: boolean;
  isRedeemed: boolean;
}

interface BondData {
  tokenName: string;
  contractAddress: string;
  coupons: Coupon[];
}

const Coupons: React.FC = () => {
  const [investedBonds, setInvestedBonds] = useState<BondData[]>([]);
  const account = useActiveAccount();
  const { bonds, isLoading: isBondsLoading } = usePrimaryMarketBonds();

  useEffect(() => {
    if (!isBondsLoading && bonds.length > 0 && account) {
      const fetchInvestedAmounts = async () => {
        const investedBondsData = await Promise.all(
          bonds.map(async (bond) => {
            const fundingContract = getContract({
              client,
              address: bond.contractAddress,
              abi: contractABI,
              chain: baseSepolia,
            });

            try {
              const investedAmountData = await readContract({
                contract: fundingContract,
                method: "investedAmountPerInvestor",
                params: [account.address],
              });

              if (investedAmountData) {
                const [investedAmount] = investedAmountData as [bigint];
                if (typeof investedAmount === "bigint" && investedAmount > BigInt(0)) {
                  // Calculate number of bond tokens
                  const bondTokens = Number(investedAmount) / (bond.currentPrice * 1e6);
                  // Calculate coupons based on bond data and invested amount
                  const coupons = calculateCoupons(bond, bondTokens);
                  return {
                    tokenName: `bt${bond.companyName.split(' ')[0].toUpperCase()}`,
                    contractAddress: bond.contractAddress,
                    coupons,
                  };
                }
              }
            } catch (error) {
              console.error(`Error fetching invested amount for ${bond.companyName}:`, error);
            }
            return null;
          })
        );

        setInvestedBonds(investedBondsData.filter((bond): bond is BondData => bond !== null));
      };

      fetchInvestedAmounts();
    }
  }, [account, bonds, isBondsLoading]);

  const calculateCoupons = (bond: Bond, bondTokens: number): Coupon[] => {
    const currentDate = new Date();
    const annualPayment = bond.faceValue * (bond.couponPercentage / 100) * bondTokens;
    const semiAnnualPayment = annualPayment / 2;

    return bond.couponDates.map((date: string, index: number) => {
      const couponDate = new Date(date);
      return {
        id: `${bond.isin}-${index + 1}`,
        date: couponDate,
        amount: parseFloat(semiAnnualPayment.toFixed(2)), // Round to 2 decimal places
        isRedeemable: couponDate <= currentDate,
        isRedeemed: false,
      };
    });
  };

  if (isBondsLoading) {
    return <div>Loading bonds...</div>;
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-6">
        {investedBonds.map((bond) => (
          <BondCouponTimeline
            key={bond.tokenName}
            tokenName={bond.tokenName}
            coupons={bond.coupons}
          />
        ))}
      </div>
    </div>
  );
};

export default Coupons;
