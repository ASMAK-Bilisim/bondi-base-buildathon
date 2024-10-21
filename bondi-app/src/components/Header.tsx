"use client"
import React, { useState, useEffect, useRef } from "react";
import { Notification03Icon } from '@hugeicons/react';
import { ConnectButton, lightTheme, useActiveAccount, SendTransactionPayModalConfig } from "thirdweb/react";
import { client } from "../client";
import { ZETA_BOND_TOKEN, ALPHA_BOND_TOKEN, BETA_BOND_TOKEN, MOCK_USDC_ADDRESS } from "../constants/contractInfo";
import { baseSepolia } from "thirdweb/chains";
import { createWallet } from "thirdweb/wallets";
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
  const [isMobile, setIsMobile] = useState(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const account = useActiveAccount();
  const navigate = useNavigate();
  const { isKYCCompleted, resetKYC } = useKYC();
  const { notifications, dismissNotification, markAsRead, unreadCount } = useNotifications();

  const wallets = [
    createWallet("com.coinbase.wallet", {
      walletConfig: {
        options: "smartWalletOnly",
      },
    }),
  ];

  const tokenAddress = MOCK_USDC_ADDRESS;

  const customTheme = lightTheme({
    colors: {
      primaryButtonBg: "#F2FBF9",
      primaryButtonText: "#1C544E",
      primaryButtonHoverBg: "#D9E8E6",
      modalBg: "#F2FBF9",
    },
    fonts: {
      body: "Inter, sans-serif",
    },
  });

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

  const customTokens = [
    {
      address: MOCK_USDC_ADDRESS,
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
    },
    {
      address: ALPHA_BOND_TOKEN,
      name: "Alpha Bond Token",
      symbol: "ALPHA",
      decimals: 18,
    },
    {
      address: BETA_BOND_TOKEN,
      name: "Beta Bond Token",
      symbol: "BETA",
      decimals: 18,
    },
    {
      address: ZETA_BOND_TOKEN,
      name: "Zeta Bond Token",
      symbol: "ZETA",
      decimals: 18,
    },
  ];

  const payModalConfig: SendTransactionPayModalConfig = {
    theme: "light",
    supportedTokens: {
      [baseSepolia.id]: [
        {
          address: MOCK_USDC_ADDRESS,
          name: "USD Coin",
          symbol: "USDC",
          decimals: 6,
        },
      ],
    },
  };

  const supportedTokens = {
    [baseSepolia.id]: customTokens
  };

  return (
    <header className="w-full font-semibold py-4 px-6 relative bg-[#F2FBF9]">
      <div className="max-w-7xl 3xl:max-w-[1800px] 4xl:max-w-[1920px] mx-auto flex items-center justify-between">
        <nav className="flex flex-wrap gap-8 justify-start items-center">
          <a href="https://www.bondifinance.io" className={linkStyle}>Home</a>
          <a href="https://www.bondifinance.io/blog" className={linkStyle}>Blog</a>
          <a href="https://www.bondifinance.io" className={linkStyle}>FAQ</a>
        </nav>
        <div className="flex items-center gap-3 whitespace-nowrap">
          {account && (
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
            <ConnectButton
              appMetadata={{
                name: "Bondi Finance",
                logoUrl: "https://blush-secondary-stoat-221.mypinata.cloud/ipfs/QmQcbcT8rNeNboZXcw3t4BiUuZ5WDWmPydHkHhKqKGbNgv",
              }}
              client={client}
              theme={customTheme}
              wallets={wallets}
              supportedChains={[baseSepolia]}
              supportedTokens={supportedTokens}
              connectButton={{
                className: "!bg-[#F2FBF9] !text-[#1C544E] hover:!bg-[#D9E8E6]",
              }}
              detailsButton={{
                className: "!bg-[#F2FBF9] !text-[#1C544E] hover:!bg-[#D9E8E6]",
                displayBalanceToken: {
                  [baseSepolia.id]: tokenAddress,
                },
              }}
              detailsModal={{
                networkSelector: {
                  sections: [
                    { label: "Testnets", chains: [baseSepolia] },
                  ],
                },
              }}
              payModal={payModalConfig}
            /> 
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
