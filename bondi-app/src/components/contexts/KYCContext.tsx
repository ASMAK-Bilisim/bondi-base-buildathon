import React, { createContext, useState, useContext, useEffect } from 'react';
import { useActiveAccount } from "thirdweb/react";

interface KYCContextType {
  isKYCCompleted: boolean;
  setKYCCompleted: (completed: boolean) => void;
  resetKYC: () => void;
}

const KYCContext = createContext<KYCContextType | undefined>(undefined);

export const KYCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isKYCCompleted, setIsKYCCompleted] = useState(false);
  const account = useActiveAccount();

  useEffect(() => {
    if (account) {
      const kycStatus = localStorage.getItem(`kycStatus_${account}`);
      setIsKYCCompleted(kycStatus === 'completed');
    } else {
      setIsKYCCompleted(false);
    }
  }, [account]);

  const setKYCCompleted = (completed: boolean) => {
    setIsKYCCompleted(completed);
    if (account) {
      localStorage.setItem(`kycStatus_${account}`, completed ? 'completed' : 'incomplete');
    }
  };

  const resetKYC = () => {
    setIsKYCCompleted(false);
    if (account) {
      localStorage.removeItem(`kycStatus_${account}`);
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
