import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePrimaryMarketBonds } from '../hooks/usePrimaryMarketBonds';
import PortfolioPerformance from '../components/PortfolioPerformance';
import BondCouponSchedule from '../components/primary_market/BondCouponSchedule';
import { DollarSquareIcon, Calendar03Icon, PercentSquareIcon, DiplomaIcon, InformationSquareIcon } from '@hugeicons/react';

const SingleBondPage: React.FC = () => {
  const { bondId } = useParams<{ bondId: string }>();
  const { bonds, isLoading, error } = usePrimaryMarketBonds();
  const navigate = useNavigate();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const bond = bonds.find(b => b.isin === bondId);
  if (!bond) return <div>Bond not found</div>;

  const bondTokenName = `bt${bond.companyName.split(' ')[0].toUpperCase()}`;

  const couponSchedule = bond.couponDates.map((date, index, array) => ({
    date: index === array.length - 1 ? bond.maturityDate : date,
    percentage: bond.couponPercentage / 2, // Assuming semi-annual coupons
  }));

  const chartName = `${bond.companyName} ${bond.couponPercentage}% ${bond.isin} ${bond.maturityDate}`;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <img src={bond.companyLogo} alt={bond.companyName} className="w-12 h-12 rounded-full" />
          <div>
            <h1 className="text-xl font-bold text-app-primary-2">{bond.companyName}</h1>
            <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/primary-market')}
          className="bg-[#f49c4a] text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-[#e58a38] transition-colors duration-300"
        >
          See Other Bond Tokens
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-lg font-bold mb-4 text-app-primary-2">Price Performance</h2>
          <PortfolioPerformance chartName={chartName} bondPrice={bond.currentPrice} />
        </div>

        <div>
          <h2 className="text-lg font-bold mb-4 text-app-primary-2">Bond Details</h2>
          <div className="flex flex-col px-6 pt-5 pb-4 font-medium text-teal-900 bg-[#F2FBF9] rounded-xl border-teal-900 border-solid border-[0.25px]">
            <div className="grid grid-cols-2 gap-4 mb-6">
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
                  <p className="text-sm text-gray-500">YTM</p>
                  <p className="font-bold">{bond.yield}%</p>
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
            <div className="mt-6">
              <h3 className="text-md font-bold mb-2 text-app-primary-2 flex items-center">
                <InformationSquareIcon className="w-5 h-5 mr-2" />
                Company Description
              </h3>
              <p className="text-sm text-gray-600">{bond.companyDescription}</p>
            </div>
          </div>
        </div>
      </div>

      <BondCouponSchedule tokenName={bondTokenName} coupons={couponSchedule} />
    </div>
  );
};

export default SingleBondPage;
