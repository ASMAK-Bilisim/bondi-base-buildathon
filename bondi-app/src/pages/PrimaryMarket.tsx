import React from 'react';
import { SmallBondCard } from '../components/primary_market/SmallBondCard';
import { usePrimaryMarketBonds } from '../hooks/usePrimaryMarketBonds';

const PrimaryMarket: React.FC = () => {
  const { bonds } = usePrimaryMarketBonds();

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