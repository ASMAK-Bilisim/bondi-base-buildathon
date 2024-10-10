import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

export const Layout: React.FC = () => {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 1400); // Changed from 1024px to 1400px
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-grow overflow-hidden">
        <Sidebar isCompact={isCompact} />
        <div className="flex flex-col flex-grow overflow-hidden">
          <Header isCompact={isCompact} setIsCompact={setIsCompact} />
          <main className="flex-grow overflow-hidden">
            <div className="h-full bg-[#D4E7E2] rounded-tl-[12px] p-6 pb-0 overflow-hidden">
              <div className="max-w-[1450px] mx-auto h-full overflow-y-auto">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};