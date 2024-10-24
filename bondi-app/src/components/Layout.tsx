import React, { useState, useEffect, ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children?: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isCompact, setIsCompact] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 1400);
      setIsMobile(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex flex-col h-screen min-h-screen-safe">
      <div className="flex flex-grow overflow-y-auto">
        <Sidebar isCompact={isCompact} />
        <div className="flex flex-col flex-grow overflow-hidden">
          <Header isCompact={isCompact} setIsCompact={setIsCompact} />
          <main className="flex-grow overflow-hidden">
            <div className={`h-full bg-[#D4E7E2] md:rounded-tl-[12px] xs:rounded-tl-none ${isMobile ? 'p-2' : 'p-6'} pb-0 overflow-hidden`}>
              <div className={`max-w-[1450px] mx-auto h-full overflow-y-auto ${isMobile ? 'pb-14 pt-safe pb-safe' : ''}`}>
                {children || <Outlet />}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
