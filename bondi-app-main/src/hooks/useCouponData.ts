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
    const fetchCoupons = async () => {
      try {
        // Mock data with three coupons
        const mockData = [
          { id: '1', date: new Date(Date.now() + 86400000), amount: 100, token: 'btZETA', isRedeemable: true },
          { id: '2', date: new Date(Date.now() + 172800000), amount: 200, token: 'btOMEGA', isRedeemable: false },
          { id: '3', date: new Date(Date.now() + 259200000), amount: 150, token: 'btYPSILON', isRedeemable: false },
        ];
        setCoupons(mockData);
        setIsLoading(false);
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  return { coupons, isLoading, error };
};