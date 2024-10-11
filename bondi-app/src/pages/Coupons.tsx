import React from 'react';
import BondCouponTimeline from '../components/Coupons/BondCouponTimeline';
import { usePrimaryMarketBonds } from '../hooks/usePrimaryMarketBonds';
import { format, addMonths, parseISO, isBefore } from 'date-fns';

const Coupons: React.FC = () => {
  const { bonds, isLoading, error } = usePrimaryMarketBonds();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Function to generate sample coupons for each bond
  const generateCoupons = (bond: any) => {
    const coupons = [];
    const startDate = parseISO(bond.maturityDate);
    const couponAmount = (bond.bondYield / 2) * (bond.totalInvestmentTarget / 100); // Assuming semi-annual coupons
    const today = new Date();

    for (let i = 0; i < 5; i++) {
      const couponDate = addMonths(startDate, -6 * (i + 1)); // Semi-annual coupons, counting backwards from maturity
      coupons.push({
        id: `${bond.isin}-${i}`,
        date: format(couponDate, 'yyyy-MM-dd'),
        amount: couponAmount,
        isRedeemable: isBefore(couponDate, today),
        isRedeemed: false // Set all coupons as not redeemed initially
      });
    }

    return coupons.reverse(); // Reverse to show earliest date first
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        {bonds.map((bond) => (
          <BondCouponTimeline
            key={bond.isin}
            tokenName={`bt${bond.companyName.split(' ')[0].toUpperCase()}`}
            coupons={generateCoupons(bond)}
            contractAddress={bond.contractAddress}
          />
        ))}
      </div>
    </div>
  );
};

export default Coupons;