import { useState, useEffect } from 'react';
import { useAddress, useContract, useContractRead } from "@thirdweb-dev/react";
import { ethers } from 'ethers';
import { usePrimaryMarketBonds } from './usePrimaryMarketBonds';
import { ZETA_BOND_TOKEN, ALPHA_BOND_TOKEN, BETA_BOND_TOKEN } from '../constants/contractInfo';

interface Coupon {
  id: string;
  date: Date;
  amount: number;
  token: string;
  isRedeemable: boolean;
  isRedeemed?: boolean; // Added isRedeemed property
}

interface BondTokenInfo {
  address: string;
  balance: number;
  couponPercentage: number;
}

export const useCouponData = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const address = useAddress();
  const { bonds } = usePrimaryMarketBonds();

  const bondTokens: BondTokenInfo[] = [
    { address: ZETA_BOND_TOKEN, balance: 0, couponPercentage: 0 },
    { address: ALPHA_BOND_TOKEN, balance: 0, couponPercentage: 0 },
    { address: BETA_BOND_TOKEN, balance: 0, couponPercentage: 0 },
  ];

  // Fetch bond token balances and coupon percentages
  bondTokens.forEach((token, index) => {
    const { contract } = useContract(token.address);
    const { data: balance } = useContractRead(contract, "balanceOf", [address]);
    
    if (balance) {
      token.balance = parseFloat(ethers.utils.formatUnits(balance, 18));
    }
    
    if (bonds[index]) {
      token.couponPercentage = bonds[index].couponPercentage;
    }
  });

  useEffect(() => {
    const fetchCoupons = () => {
      setIsLoading(true);
      try {
        const now = new Date();
        const couponData: Coupon[] = [];

        bondTokens.forEach((token, index) => {
          if (token.balance > 0) {
            const bondName = `bt${bonds[index].companyName.split(' ')[0].toUpperCase()}`;
            for (let i = 0; i < 5; i++) {
              const couponDate = new Date(now.getTime() + (i + 1) * 30 * 24 * 60 * 60 * 1000); // Every 30 days
              const couponAmount = (token.couponPercentage / 2) * (token.balance * 100); // Assuming face value of 100
              couponData.push({
                id: `${bondName}-${i}`,
                date: couponDate,
                amount: couponAmount,
                token: bondName,
                isRedeemable: couponDate <= now,
                isRedeemed: false, // Initialize isRedeemed as false
              });
            }
          }
        });

        setCoupons(couponData.sort((a, b) => a.date.getTime() - b.date.getTime()));
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        setIsLoading(false);
      }
    };

    fetchCoupons();
  }, [address, bonds, bondTokens]); // Ensure dependencies are correct

  return { coupons, isLoading, error, bondTokens };
};
