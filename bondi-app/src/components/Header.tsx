import React, { useState, useEffect, useRef } from "react";
import { Notification03Icon } from '@hugeicons/react';
import { ConnectWallet, useAddress } from "@thirdweb-dev/react";
import { useNavigate } from "react-router-dom";
import NotificationDropdown from './NotificationComponents/NotificationDropdown';
import UnreadNotification from './NotificationComponents/UnreadNotification';
import { useKYC } from '../components/contexts/KYCContext';
import { useNotifications } from '../components/contexts/NotificationContext';

interface HeaderProps {
  isCompact: boolean;
  setIsCompact: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ isCompact, setIsCompact }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const address = useAddress();
  const navigate = useNavigate();
  const { isKYCCompleted, resetKYC } = useKYC();
  const { notifications, dismissNotification, markAsRead, unreadCount } = useNotifications();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      notifications.forEach(n => !n.read && markAsRead(n.id));
    }
  };

  const handleKYCRedirect = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate("/kyc");
  };

  const handleResetKYC = () => {
    resetKYC();
  };

  const linkStyle = "font-inter font-medium text-[16px] leading-[26px] text-[#1C544E] hover:underline transition-all duration-300";

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
          {address && (
            <div className="relative flex items-center" ref={notificationRef}>
              <div className="flex items-center bg-[#F2FBF9] rounded-lg border border-[#1C544E] overflow-visible">
                <button
                  onClick={toggleNotifications}
                  className="w-10 h-10 flex items-center justify-center cursor-pointer group"
                >
                  <Notification03Icon className="w-6 h-6 text-[#1C544E] group-hover:animate-shake" />
                </button>
                {!isKYCCompleted && (
                  <button
                    onClick={handleKYCRedirect}
                    className="px-2 h-6 bg-red-500 text-white text-[14px] font-inter hover:bg-red-600 transition-colors duration-300 flex items-center rounded-[4px] mr-2 cursor-pointer animate-pulseGlow shadow-red-glow"
                  >
                    Complete KYC
                  </button>
                )}
                {isKYCCompleted && (
                  <button
                    onClick={handleResetKYC}
                    className="px-2 h-6 bg-blue-500 text-white text-[14px] font-inter hover:bg-blue-600 transition-colors duration-300 flex items-center rounded-[4px] mr-2 cursor-pointer"
                  >
                    Reset KYC
                  </button>
                )}
              </div>
              {unreadCount > 0 && (
                <UnreadNotification count={unreadCount} />
              )}
              <NotificationDropdown 
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                notifications={notifications}
                onDismiss={dismissNotification}
              />
            </div>
          )}
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
