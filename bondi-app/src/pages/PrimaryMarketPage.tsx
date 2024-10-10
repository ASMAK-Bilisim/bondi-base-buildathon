import React from 'react';
import { SmallBondCard } from '../components/primary_market/SmallBondCard';
import { usePrimaryMarketBonds } from '../hooks/usePrimaryMarketBonds';

const PrimaryMarketPage: React.FC = () => {
  const { bonds, isLoading, error } = usePrimaryMarketBonds();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      {bonds.length === 0 ? (
        <div>No bonds available at the moment.</div>
      ) : (
        bonds.map((bond, index) => (
          <SmallBondCard key={index} data={bond} />
        ))
      )}
    </div>
  );
};

export default PrimaryMarketPage;