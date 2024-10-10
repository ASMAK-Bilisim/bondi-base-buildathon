import React, { useState, useEffect } from "react";
import { MoneyBag02Icon, LinkSquare01Icon, Sorting05Icon } from '@hugeicons/react';
import { useNavigate } from 'react-router-dom';
import { usePrimaryMarketBonds } from '../../hooks/usePrimaryMarketBonds';

interface BondTokenRowProps {
  token: {
    name: string;
    progress: number;
  };
}

const BondTokenRow: React.FC<BondTokenRowProps> = ({ token }) => {
  const progressColor = token.progress > 10 ? '#4fc484' : '#f49c4a';
  const statusIcon = token.progress < 10 ? '/assets/OrangeStatus.png' : '/assets/GreenStatus.png';

  return (
    <div className="flex items-center py-3 w-full text-[16px] sm:text-[16px] md:text-[16px] lg:text-[14px] font-medium text-teal-900 whitespace-nowrap border-solid border-b-[0.25px] border-b-teal-900 last:border-b-0 h-1/3">
      <div className="w-1/6 flex items-center justify-center">
        <img
          src={statusIcon}
          alt="Payment Pending"
          className="w-7 sm:w-10 md:w-9 lg:w-10 h-7 sm:h-10 md:h-9 lg:h-10 rounded-full border-2 border-[#f2fbf9] animate-pulse-border"
        />
      </div>
      <div className="w-1/3 flex items-center justify-center">
        <span className="pl-2">{token.name}</span>
      </div>
      <div className="w-1/2 flex items-center">
        <div className="w-14 text-right mr-2">{token.progress.toFixed(1)}%</div>
        <div className="flex-grow h-3 rounded-full overflow-hidden" style={{ backgroundColor: `${progressColor}33` }}>
          <div 
            className="h-full rounded-full"
            style={{ width: `${token.progress}%`, backgroundColor: progressColor }}
          />
        </div>
      </div>
    </div>
  );
};

const BondTokensFunding: React.FC = () => {
  const navigate = useNavigate();
  const { bonds, isLoading, error } = usePrimaryMarketBonds();
  const [sortAscending, setSortAscending] = useState(true);
  const [sortedTokens, setSortedTokens] = useState<Array<{ name: string; progress: number }>>([]);

  useEffect(() => {
    if (!isLoading && !error && bonds.length > 0) {
      const tokensWithProgress = bonds.map(bond => ({
        name: `bt${bond.companyName.split(' ')[0].toUpperCase()}`,
        progress: bond.investmentProgress
      }));

      setSortedTokens(tokensWithProgress.sort((a, b) => 
        sortAscending ? a.progress - b.progress : b.progress - a.progress
      ));
    }
  }, [bonds, isLoading, error, sortAscending]);

  const handlePrimaryMarketClick = () => {
    navigate("/primary-market");
  };

  const toggleSort = () => {
    setSortAscending(!sortAscending);
  };

  if (isLoading) {
    return <div>Loading bond tokens...</div>;
  }

  if (error) {
    return <div>Error loading bond tokens: {error.message}</div>;
  }

  return (
    <section className="flex flex-col px-2 sm:px-5 md:px-3 lg:px-5 pt-3 sm:pt-5 md:pt-4 lg:pt-5 pb-2 sm:pb-4 md:pb-3 lg:pb-4 font-inter text-[#1c544e] bg-[#F2FBF9] rounded-xl border-teal-900 border-solid border-[0.25px] w-full h-[270px] sm:h-[300px] md:h-[280px] lg:h-[300px]">
      <header className="flex items-center justify-between mb-2 sm:mb-4 md:mb-3 lg:mb-4">
        <div className="flex items-center">
          <MoneyBag02Icon className="w-4 sm:w-6 md:w-5 lg:w-6 h-4 sm:h-6 md:h-5 lg:h-6 text-[#1c544e] mr-2" />
          <h2 className="text-sm sm:text-lg md:text-base lg:text-lg font-bold">Bond Tokens in Funding Phase</h2>
        </div>
        <LinkSquare01Icon 
          className="w-4 sm:w-6 md:w-5 lg:w-6 h-4 sm:h-6 md:h-5 lg:h-6 text-[#1c544e] cursor-pointer transition-transform duration-200 ease-in-out hover:scale-110" 
          onClick={handlePrimaryMarketClick}
          variant="solid"
        />
      </header>
      <div className="flex text-[16px] sm:text-[16px] md:text-[16px] lg:text-[14px] font-medium text-teal-900 text-opacity-60 mb-2">
        <div className="w-1/6 text-center">Status</div>
        <div className="w-1/3 text-center">Bond Token</div>
        <div className="w-1/2 flex items-center">
          <div className="w-14 text-right mr-2">Progress</div>
          <Sorting05Icon
            className="w-4 h-4 cursor-pointer ml-1"
            onClick={toggleSort}
          />
          <div className="flex-grow"></div>
        </div>
      </div>
      <div className="overflow-y-auto pr-2 flex-grow">
        {sortedTokens.length > 0 ? (
          sortedTokens.map((token, index) => (
            <BondTokenRow key={index} token={token} />
          ))
        ) : (
          <div>No bond tokens available</div>
        )}
      </div>
    </section>
  );
};

export default BondTokensFunding;