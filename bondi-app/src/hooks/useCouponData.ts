import { useState, useEffect } from 'react';

interface Coupon {
  id: string;
  date: Date;
  amount: number;
  token: string;
  isRedeemable: boolean;
}

export const useCouponData = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulating an API call
    setTimeout(() => {
      const mockCoupons: Coupon[] = [
        { id: '1', date: new Date(), amount: 100, token: 'btZETA', isRedeemable: true },
        { id: '2', date: new Date(Date.now() + 86400000), amount: 150, token: 'btOMEGA', isRedeemable: false },
        { id: '3', date: new Date(Date.now() + 172800000), amount: 200, token: 'btALPHA', isRedeemable: false },
      ];
      setCoupons(mockCoupons);
      setIsLoading(false);
    }, 1000);
  }, []);

  return { coupons, isLoading, error };
};