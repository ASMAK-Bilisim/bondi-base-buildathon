import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAddress } from "@thirdweb-dev/react";

interface KYCContextType {
  isKYCCompleted: boolean;
  setKYCCompleted: (completed: boolean) => void;
  resetKYC: () => void;
}

const KYCContext = createContext<KYCContextType | undefined>(undefined);

export const KYCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isKYCCompleted, setIsKYCCompleted] = useState(false);
  const address = useAddress();

  useEffect(() => {
    if (address) {
      const whitelistedAddresses = JSON.parse(localStorage.getItem('kycWhitelist') || '[]');
      setIsKYCCompleted(whitelistedAddresses.includes(address));
    } else {
      setIsKYCCompleted(false);
    }
  }, [address]);

  const setKYCCompleted = (completed: boolean) => {
    setIsKYCCompleted(completed);
    if (completed && address) {
      const whitelistedAddresses = JSON.parse(localStorage.getItem('kycWhitelist') || '[]');
      if (!whitelistedAddresses.includes(address)) {
        whitelistedAddresses.push(address);
        localStorage.setItem('kycWhitelist', JSON.stringify(whitelistedAddresses));
      }
    }
  };

  const resetKYC = () => {
    setIsKYCCompleted(false);
    if (address) {
      const whitelistedAddresses = JSON.parse(localStorage.getItem('kycWhitelist') || '[]');
      const updatedAddresses = whitelistedAddresses.filter((addr: string) => addr !== address);
      localStorage.setItem('kycWhitelist', JSON.stringify(updatedAddresses));
    }
  };

  return (
    <KYCContext.Provider value={{ isKYCCompleted, setKYCCompleted, resetKYC }}>
      {children}
    </KYCContext.Provider>
  );
};

export const useKYC = () => {
  const context = useContext(KYCContext);
  if (context === undefined) {
    throw new Error('useKYC must be used within a KYCProvider');
  }
  return context;
};