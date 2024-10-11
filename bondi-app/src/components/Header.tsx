import React, { useState, useEffect } from "react";
import { Notification03Icon } from '@hugeicons/react';
import { ConnectWallet, useAddress } from "@thirdweb-dev/react";
import { useNavigate } from "react-router-dom";
import NotificationDropdown from './NotificationComponents/NotificationDropdown';
import UnreadNotification from './NotificationComponents/UnreadNotification';
import { useKYC } from '../components/contexts/KYCContext';

interface HeaderProps {
  isCompact: boolean;
  setIsCompact: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

const Header: React.FC<HeaderProps> = ({ isCompact, setIsCompact }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const address = useAddress();
  const navigate = useNavigate();
  const { isKYCCompleted, resetKYC } = useKYC();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadNotifications(0);
    }
  };

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id === id));
  };

  const handleViewNotification = (id: string) => {
    console.log(`Viewing notification ${id}`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleKYCRedirect = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/kyc");
  };

  const handleResetKYC = () => {
    resetKYC();
  };

  const linkStyle = "font-inter font-medium text-[16px] leading-[26px] text-[#1C544E] hover:underline transition-all duration-300";

  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    setUnreadNotifications(unreadCount);
  }, [notifications]);

  const isCompactOrMobile = isCompact || isMobile;

  return (
    <header className="w-full font-semibold py-4 px-6 relative bg-[#F2FBF9]">
      <div className="max-w-7xl 3xl:max-w-[1800px] 4xl:max-w-[1920px] mx-auto flex items-center justify-between">
        <nav className="flex flex-wrap gap-8 justify-start items-center">
          <a href="https://www.bondifinance.io" className={linkStyle}>Home</a>
          <a href="https://www.bondifinance.io/blog" className={linkStyle}>Blog</a>
          <a href="https://www.bondifinance.io" className={linkStyle}>FAQ</a>
        </nav>
        <div className="flex items-center gap-3 whitespace-nowrap">
          <div className="relative flex items-center">
            <div className="flex items-center bg-[#F2FBF9] rounded-lg border border-[#1C544E] overflow-visible">
              <button
                onClick={toggleNotifications}
                className="w-10 h-10 flex items-center justify-center cursor-pointer group"
              >
                <Notification03Icon className="w-6 h-6 text-[#1C544E] group-hover:animate-shake" />
              </button>
              {address && !isKYCCompleted && (
                <button
                  onClick={handleKYCRedirect}
                  className="px-2 h-6 bg-red-500 text-white text-[14px] font-inter hover:bg-red-600 transition-colors duration-300 flex items-center rounded-[4px] mr-2 cursor-pointer animate-pulseGlow shadow-red-glow"
                >
                  Complete KYC
                </button>
              )}
              {address && isKYCCompleted && (
                <button
                  onClick={handleResetKYC}
                  className="px-2 h-6 bg-blue-500 text-white text-[14px] font-inter hover:bg-blue-600 transition-colors duration-300 flex items-center rounded-[4px] mr-2 cursor-pointer"
                >
                  Reset KYC
                </button>
              )}
            </div>
            {unreadNotifications > 0 && (
              <UnreadNotification count={unreadNotifications} />
            )}
            <NotificationDropdown 
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              notifications={notifications}
              onDismiss={handleDismissNotification}
              onView={handleViewNotification}
            />
          </div>
          <div className="rounded-lg border border-[#1C544E] overflow-hidden">
            <ConnectWallet 
              theme={isCompactOrMobile ? "light" : "light"}
              btnTitle={isCompactOrMobile ? "Connect" : "Connect Wallet"}
              modalSize="wide"
              className={`!bg-[#F2FBF9] !text-[#1C544E] hover:!bg-[#E5F5F2] !transition-colors !font-inter !font-bold !text-[16px] !leading-[14px] !rounded-none !border-none ${
                isCompactOrMobile 
                  ? '!px-2 !h-10' 
                  : '!px-3 !h-10'
              }`}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;