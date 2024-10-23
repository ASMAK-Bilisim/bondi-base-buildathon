import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePrimaryMarketBonds } from '../hooks/usePrimaryMarketBonds';
import PortfolioPerformance from '../components/PortfolioPerformance';
import BondCouponTimeline from '../components/Coupons/BondCouponTimeline';
import { DollarSquareIcon, Calendar03Icon, PercentSquareIcon, DiplomaIcon, InformationSquareIcon } from '@hugeicons/react';

export default function SingleBondPage() {
  const { bondId } = useParams<{ bondId: string }>();
  const { bonds, isLoading, error } = usePrimaryMarketBonds();
  const navigate = useNavigate();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const bond = bonds.find(b => b.isin === bondId);
  if (!bond) return <div>Bond not found</div>;

  const bondTokenName = `bt${bond.companyName.split(' ')[0].toUpperCase()}`;

  const coupons = bond.couponDates.map((date, index) => ({
    id: `coupon-${index}`,
    date: new Date(date),
    amount: bond.couponPercentage / 2,
    isRedeemable: new Date(date) <= new Date(),
    isRedeemed: false,
  }));

  coupons.push({
    id: 'maturity',
    date: new Date(bond.maturityDate),
    amount: 100,
    isRedeemable: new Date(bond.maturityDate) <= new Date(),
    isRedeemed: false,
  });

  const chartTitle = `${bond.companyName} - ${bond.isin}`;

  return (
    <div className="p-2 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img src={bond.companyLogo} alt={bond.companyName} className="w-12 h-12 rounded-full" />
          <div>
            <h1 className="text-xl font-bold text-app-primary-2">{bond.companyName}</h1>
            <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/primary-market')}
          className="bg-[#f49c4a] text-white px-4 py-2 rounded-lg lg:text-[16px] xs:text-[13px] font-semibold hover:bg-[#e58a38] transition-colors duration-300"
        >
          See Other Bond Tokens
        </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:space-x-6">
        <div className="w-full lg:w-1/2">
          <h2 className="text-lg font-bold mb-2 text-app-primary-2">Price Performance</h2>
          <div className="h-[300px]">
            <PortfolioPerformance 
              chartTitle={chartTitle}
              onTimeRangeChange={() => {}}
            />
          </div>
        </div>

        <div className="w-full lg:w-1/2 mt-4 lg:mt-0">
          <h2 className="text-lg font-bold mb-2 text-app-primary-2">Bond Details</h2>
          <div className="flex flex-col px-6 pt-5 pb-4 font-medium text-teal-900 bg-[#F2FBF9] rounded-xl border-teal-900 border-solid border-[0.25px] lg:h-[300px] xs:h-full overflow-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <DollarSquareIcon className="w-6 h-6 text-app-primary-2" />
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-bold">${bond.currentPrice}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar03Icon className="w-6 h-6 text-app-primary-2" />
                <div>
                  <p className="text-sm text-gray-500">Maturity</p>
                  <p className="font-bold">{bond.maturityDate}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <PercentSquareIcon className="w-6 h-6 text-app-primary-2" />
                <div>
                  <p className="text-sm text-gray-500">Coupon</p>
                  <p className="font-bold">{bond.couponPercentage}%</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <PercentSquareIcon className="w-6 h-6 text-app-primary-2" />
                <div>
                  <p className="text-sm text-gray-500">YTM</p>
                  <p className="font-bold">{bond.bondYield}%</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <DiplomaIcon className="w-6 h-6 text-app-primary-2" />
                <div>
                  <p className="text-sm text-gray-500">ISIN</p>
                  <p className="font-bold">{bond.isin}</p>
                </div>
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-md font-bold mb-2 text-app-primary-2 flex items-center">
                <InformationSquareIcon className="w-5 h-5 mr-2" />
                Company Description
              </h3>
              <p className="text-sm text-gray-600">{bond.companyDescription}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <BondCouponTimeline 
          tokenName={bondTokenName} 
          coupons={coupons} 
          displayPercentage={true}
        />
      </div>
    </div>
  );
}