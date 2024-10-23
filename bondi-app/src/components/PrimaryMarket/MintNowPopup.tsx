import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { CancelSquareIcon } from '@hugeicons/react';
import { useSendTransaction, useActiveAccount, useReadContract } from "thirdweb/react";
import { prepareContractCall, getContract } from "thirdweb";
import { client } from '../../client';
import { baseSepolia } from 'thirdweb/chains';
import { bondDistributionABI } from '../../constants/contractInfo';
import { useNotifications } from '../contexts/NotificationContext';
import { useRive } from '@rive-app/react-canvas';
import { useContractInfo } from '../../hooks/useContractInfo';

interface MintNowPopupProps {
  onClose: () => void;
  bondData: {
    companyName: string;
    contractAddress: string;
  };
}

const MintNowPopup: React.FC<MintNowPopupProps> = ({ onClose, bondData }) => {
  const bondTokenName = `bt${bondData.companyName.split(' ')[0].toUpperCase()}`;
  const [isMinting, setIsMinting] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [investedAmount, setInvestedAmount] = useState<string>('0.00');
  const [tokensToMint, setTokensToMint] = useState<string>('0.0000');
  const [bondPrice, setBondPrice] = useState<string>('0.00');
  const { mutateAsync: sendTx } = useSendTransaction();
  const { addNotification } = useNotifications();
  const account = useActiveAccount();

  const [isSuccess, setIsSuccess] = useState(false);

  const { RiveComponent, rive } = useRive({
    src: '/animations/minting.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
  });

  const { 
    fundingContract, 
    bondTokenAddress,
    isLoading: isContractInfoLoading,
    error: contractInfoError
  } = useContractInfo(bondData.contractAddress);

  const bondDistributionContract = getContract({
    client,
    address: bondTokenAddress || '',
    abi: bondDistributionABI,
    chain: baseSepolia,
  });

  const { data: investedAmountData, isLoading: isInvestedAmountLoading } = useReadContract({
    contract: fundingContract,
    method: "investedAmountPerInvestor",
    params: [account?.address || '0x'],
  });

  const { data: bondPriceData, isLoading: isBondPriceLoading } = useReadContract({
    contract: bondDistributionContract,
    method: "bondPrice",
  });

  useEffect(() => {
    if (rive) {
      rive.play();
    }
  }, [rive]);

  useEffect(() => {
    if (bondPriceData) {
      const price = typeof bondPriceData === 'bigint' 
        ? Number(bondPriceData) / 1e6 // Assuming 6 decimal places for USDC
        : Number(bondPriceData);
      setBondPrice(price.toFixed(2));
    }
  }, [bondPriceData]);

  useEffect(() => {
    if (investedAmountData && bondPrice) {
      const [investedAmount] = investedAmountData as [bigint];
      if (typeof investedAmount === 'bigint') {
        const formattedInvestedAmount = (Number(investedAmount) / 1e6).toFixed(2);
        setInvestedAmount(formattedInvestedAmount);
        
        // Calculate tokens to mint with 4 decimal places
        const tokens = Number(formattedInvestedAmount) / Number(bondPrice);
        setTokensToMint(tokens.toFixed(4));
      } else {
        console.error('Invalid invested amount data:', investedAmount);
        setInvestedAmount('0.00');
        setTokensToMint('0.0000');
      }
    }
  }, [investedAmountData, bondPrice]);

  const handleMint = async () => {
    if (!bondTokenAddress) {
      addNotification({
        title: "Minting Failed",
        message: "Bond token address is not available.",
        type: "error"
      });
      return;
    }

    setIsMinting(true);
    setShowAnimation(true);
    try {
      console.log("Bond Token Address:", bondTokenAddress);
      
      const transaction = await prepareContractCall({
        contract: bondDistributionContract,
        method: "claimBondTokens",
        params: [],
      });

      console.log("Transaction prepared:", transaction);

      const tx = await sendTx(transaction);
      console.log("Transaction sent:", tx);

      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);

      if (receipt.status === 1) { // Check if the transaction was successful
        addNotification({
          title: "Minting Successful",
          message: `Successfully minted ${tokensToMint} ${bondTokenName} tokens.`,
          type: "success"
        });

        setIsSuccess(true);
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("Detailed error:", error);
      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Error stack:", error.stack);
      }
      addNotification({
        title: "Minting Failed",
        message: `Error minting bond tokens: ${errorMessage}`,
        type: "error"
      });
    } finally {
      setIsMinting(false);
      setShowAnimation(false);
    }
  };

  if (isContractInfoLoading || isInvestedAmountLoading || isBondPriceLoading) {
    return <div>Loading contract information...</div>;
  }

  if (contractInfoError) {
    return <div>Error loading contract information: {contractInfoError.message}</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-[#F2FBF9] rounded-xl w-full max-w-md aspect-square relative flex flex-col overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#1C544E] hover:text-[#3EBAAD] transition-colors z-10"
        >
          <CancelSquareIcon 
            size={24}
            variant="stroke"
            className="transition-colors duration-200"
            color="currentColor"
          />
        </button>

        <div className="flex flex-col h-full p-6">
          <h2 className="text-xl font-bold text-[#1C544E] mb-4 text-left">
            {isSuccess ? "Minting Successful!" : "Mint Your Token"}
          </h2>

          <div className="flex-grow flex flex-col justify-between items-center">
            {showAnimation ? (
              <div className="w-[280px] h-[280px]">
                <RiveComponent />
              </div>
            ) : isSuccess ? (
              <>
                <div className="relative w-32 h-32 mb-2 shine-effect rounded-full overflow-hidden">
                  <img src="/assets/SuccessIcon.png" alt="Success" className="w-full h-full object-cover" />
                </div>
                <p className="text-lg font-bold text-[#1C544E] mb-6">
                  You have successfully minted {tokensToMint} {bondTokenName} tokens!
                </p>
              </>
            ) : (
              <>
                <div className="relative w-32 h-32 mb-2 shine-effect rounded-full overflow-hidden">
                  <img src="/assets/TokenMint.png" alt="Token Mint" className="w-full h-full object-cover" />
                </div>
                <p className="text-lg font-bold text-[#1C544E] mb-6">{bondTokenName}</p>

                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#1C544E]">Price:</span>
                    <span className="font-bold text-[#1C544E]">${bondPrice}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#1C544E]">Your Investment:</span>
                    <span className="font-bold text-[#1C544E]">${investedAmount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#1C544E]">Tokens to Mint:</span>
                    <span className="font-bold text-[#1C544E]">{tokensToMint}</span>
                  </div>
                </div>
              </>
            )}

            {isSuccess ? (
              <Button
                label="Close"
                intent="primary"
                size="large"
                className="w-full py-3 text-lg font-semibold mt-6"
                onClick={onClose}
              />
            ) : (
              <Button
                label={isMinting ? "Minting..." : "Mint Now"}
                intent="primary"
                size="large"
                className="w-full py-3 text-lg font-semibold mt-6"
                onClick={handleMint}
                disabled={isMinting || tokensToMint === '0.0000'}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MintNowPopup;
