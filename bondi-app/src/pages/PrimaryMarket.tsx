import React from 'react';
import { SmallBondCard } from '../components/primary_market/SmallBondCard';
import { usePrimaryMarketBonds } from '../hooks/usePrimaryMarketBonds';

const PrimaryMarket: React.FC = () => {
  const { bonds, isLoading, error } = usePrimaryMarketBonds();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-app-primary-2"></div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="h-full overflow-y-auto p-4 text-[#1c544e]">
      <div className="max-w-7xl mx-auto space-y-4">
        {bonds.map((bond, index) => (
          <SmallBondCard key={index} data={bond} />
        ))}
      </div>
    </div>
  );
};

export default PrimaryMarket;
