import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import News from '../components/home/News';
import Highlights from '../components/home/Highlights';
import PortfolioPerformance from '../components/home/PortfolioPerformance';
import CouponDisbursement from '../components/home/CouponDisbursement';
import BondTokensFunding from '../components/home/BondTokensFunding';

const Home: React.FC = () => {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const checkCompactLayout = () => {
      const aspectRatio = window.innerWidth / window.innerHeight;
      const isNarrow = window.innerWidth < 800;
      setIsCompact(aspectRatio < 1.2 || isNarrow);
    };

    window.addEventListener('resize', checkCompactLayout);
    checkCompactLayout();

    return () => window.removeEventListener('resize', checkCompactLayout);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 3xl:mb-5 4xl:mb-6">
        {!isCompact && (
          <h1 className="font-inter text-[20px] sm:text-[24px] 3xl:text-[28px] 4xl:text-[32px] font-bold text-[#1C544E]">
            Welcome
          </h1>
        )}
        <Link
          to="/primary-market"
          className={`bg-[#F49C4A] text-white font-inter font-bold text-[12px] 3xl:text-[14px] 4xl:text-[16px] px-4 rounded-lg hover:bg-[#e08b39] transition-colors duration-300 ${
            isCompact ? 'w-full text-center py-3' : 'py-2.5 3xl:py-3 4xl:py-3.5'
          }`}
        >
          See Other Bond Tokens
        </Link>
      </header>
      <main className="flex flex-col w-full gap-4 3xl:gap-5 4xl:gap-6 flex-1 overflow-auto pb-1">
        <section className={`flex ${isCompact ? 'flex-col' : 'flex-row'} w-full gap-4 3xl:gap-5 4xl:gap-6`}>
          {!isCompact && (
            <div className="w-[calc(66.666%-8px)] 3xl:w-[calc(66.666%-10px)] 4xl:w-[calc(66.666%-12px)] min-h-[250px] lg:min-h-[350px] 3xl:min-h-[400px] 4xl:min-h-[450px]">
              <News />
            </div>
          )}
          <div className={`${isCompact ? 'w-full' : 'w-[calc(33.333%-8px)] 3xl:w-[calc(33.333%-10px)] 4xl:w-[calc(33.333%-12px)]'} min-h-[300px] lg:min-h-[350px] 3xl:min-h-[400px] 4xl:min-h-[450px]`}>
            <Highlights />
          </div>
        </section>
        <section className={`w-full flex ${isCompact ? 'flex-col' : 'flex-row'} gap-4 3xl:gap-5 4xl:gap-6`}>
          <div className={`${isCompact ? 'w-full' : 'w-[calc(33.333%-8px)] 3xl:w-[calc(33.333%-10px)] 4xl:w-[calc(33.333%-12px)]'}`}>
            <PortfolioPerformance />
          </div>
          <div className={`${isCompact ? 'w-full' : 'w-[calc(33.333%-8px)] 3xl:w-[calc(33.333%-10px)] 4xl:w-[calc(33.333%-12px)]'}`}>
            <CouponDisbursement />
          </div>
          <div className={`${isCompact ? 'w-full' : 'w-[calc(33.333%-8px)] 3xl:w-[calc(33.333%-10px)] 4xl:w-[calc(33.333%-12px)]'}`}>
            <BondTokensFunding />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;