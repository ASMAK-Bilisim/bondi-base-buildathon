import { useState, useEffect } from 'react';
import { useActiveAccount } from "thirdweb/react";
import { getContract } from "thirdweb";
import { usePrimaryMarketBonds } from './usePrimaryMarketBonds';
import {
  ZETA_BOND_TOKEN,
  ALPHA_BOND_TOKEN,
  BETA_BOND_TOKEN,
} from '../constants/contractInfo';
import { baseSepolia } from "thirdweb/chains";
import { client } from '../client';

interface Coupon {
  id: string;
  date: Date;
  amount: number;
  token: string;
  isRedeemable: boolean;
  isRedeemed?: boolean;
}

interface BondTokenInfo {
  address: string;
  balance: number;
  couponPercentage: number;
}

export const useCouponData = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const account = useActiveAccount();
  const { bonds } = usePrimaryMarketBonds();

  const bondTokens: BondTokenInfo[] = [
    { address: ZETA_BOND_TOKEN, balance: 0, couponPercentage: 0 },
    { address: ALPHA_BOND_TOKEN, balance: 0, couponPercentage: 0 },
    { address: BETA_BOND_TOKEN, balance: 0, couponPercentage: 0 },
  ];

  useEffect(() => {
    const fetchBondTokenBalances = async () => {
      if (!account) return;

      setIsLoading(true);

      try {
        for (let index = 0; index < bondTokens.length; index++) {
          const token = bondTokens[index];
          const bondContract = getContract({
            address: token.address,
            client: client,
            chain: baseSepolia,
          });

          // Call the contract method directly
          const balanceData = await bondContract.call("balanceOf", account);

          if (balanceData) {
            token.balance = Number(balanceData.toString()) / 1e6; // Assuming USDC has 6 decimals
          }

          if (bonds[index]) {
            token.couponPercentage = bonds[index].couponPercentage;
          }
        }

        setCoupons(generateCoupons(bondTokens));
      } catch (error) {
        console.error('Error fetching bond token balances:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBondTokenBalances();
  }, [account, bonds]);

  const generateCoupons = (tokens: BondTokenInfo[]): Coupon[] => {
    const now = new Date();
    let couponData: Coupon[] = [];

    tokens.forEach((token, index) => {
      if (token.balance > 0 && bonds[index]) {
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
            isRedeemed: false,
          });
        }
      }
    });

    // Sort coupons by date
    couponData.sort((a, b) => a.date.getTime() - b.date.getTime());

    return couponData;
  };

  return { coupons, isLoading, bondTokens };
};
