import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSquareIcon,
  Calendar03Icon,
  PercentSquareIcon,
  DiplomaIcon,
  InformationSquareIcon,
} from '@hugeicons/react';
import { client } from '../../client';
import { baseSepolia } from 'thirdweb/chains';
import { cdsManagerABI, CDS_MANAGER_ADDRESS, MOCK_USDC_ADDRESS, mockUsdcABI } from '../../constants/contractInfo';
import { useReadContract, useSendTransaction } from 'thirdweb/react';
import { getContract, prepareContractCall } from 'thirdweb';
import { TransactionButton } from "thirdweb/react";
import { parseEther, formatEther } from "viem";
import { Abi } from 'viem';
interface BondInfo {
  hash: string;
  bondTokenAddress: string;
  nextCouponAmount: string;
  nextCouponDate: number;
}

interface BondOrderBookProps {
  bondInfo: BondInfo;
}

interface CDSInfo {
  cdsID: number;
  bondAddressAndExpiration: string;
  creator: string;
  buyer: string;
  premium: string;
  isActive: boolean;
  isClaimed: boolean;
  isAccused: boolean;
}

interface GroupedOffer {
  premium: string;
  offers: CDSInfo[];
}

const BondOrderBook: React.FC<BondOrderBookProps> = ({ bondInfo }) => {
  const [cdsOffers, setCdsOffers] = useState<CDSInfo[]>([]);
  const [isBuyMode, setIsBuyMode] = useState(true);
  const [premium, setPremium] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const { showNotification } = useNotifications(); // Uncomment when implemented

  const cdsManagerContract = getContract({
    client,
    address: CDS_MANAGER_ADDRESS,
    abi: cdsManagerABI,
    chain: baseSepolia,
  });

  const usdcContract = getContract({
    client,
    address: MOCK_USDC_ADDRESS,
    abi: mockUsdcABI,
    chain: baseSepolia,
  });

  const { mutate: sendTx } = useSendTransaction();

  const { data: cdsCount } = useReadContract({
    contract: cdsManagerContract,
    method: "function getCDSCount() view returns (uint256)",
  });

  useEffect(() => {
    const fetchCDSOffers = async () => {
      if (cdsCount) {
        const offers: CDSInfo[] = [];
        for (let i = 0; i < Number(cdsCount); i++) {
          try {
            const cdsInfo = await cdsManagerContract.read.getCDS([BigInt(i)]);
            if (cdsInfo && cdsInfo[1] === bondInfo.hash) {
              offers.push({
                cdsID: Number(cdsInfo[0]),
                bondAddressAndExpiration: cdsInfo[1],
                creator: cdsInfo[2],
                buyer: cdsInfo[3],
                premium: formatEther(cdsInfo[4]),
                isActive: cdsInfo[5],
                isClaimed: cdsInfo[6],
                isAccused: cdsInfo[7],
              });
            }
          } catch (error) {
            console.error(`Error fetching CDS info for ID ${i}:`, error);
          }
        }
        setCdsOffers(offers);
      }
    };

    fetchCDSOffers();
  }, [cdsCount, bondInfo.hash, cdsManagerContract]);

  const groupedOffers = useMemo(() => {
    const grouped: { [key: string]: GroupedOffer } = {};
    cdsOffers.forEach(offer => {
      if (!grouped[offer.premium]) {
        grouped[offer.premium] = { premium: offer.premium, offers: [] };
      }
      grouped[offer.premium].offers.push(offer);
    });
    return Object.values(grouped).sort((a, b) => Number(a.premium) - Number(b.premium));
  }, [cdsOffers]);

  const handleCreateCDS = async () => {
    if (!premium) {
      // showNotification("Please enter a premium amount", "error");
      console.error("Please enter a premium amount");
      return;
    }

    setIsLoading(true);
    try {
      const premiumWei = parseEther(premium);
      const transaction = prepareContractCall({
        contract: cdsManagerContract,
        method: "function createCDS(bytes32 bondAddressAndExpiration, uint256 premium) external returns (uint256)",
        params: [bondInfo.hash, premiumWei],
      });
      await sendTx(transaction);
      // showNotification("CDS offer created successfully", "success");
      console.log("CDS offer created successfully");
    } catch (error) {
      console.error("Error creating CDS:", error);
      // showNotification("Failed to create CDS offer", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyCDS = async (cdsID: number) => {
    setIsLoading(true);
    try {
      const transaction = prepareContractCall({
        contract: cdsManagerContract,
        method: "function buyCDS(uint256 cdsID) external returns (bool)",
        params: [BigInt(cdsID)],
      });
      await sendTx(transaction);
      // showNotification("CDS bought successfully", "success");
      console.log("CDS bought successfully");
    } catch (error) {
      console.error("Error buying CDS:", error);
      // showNotification("Failed to buy CDS", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const amount = parseEther(isBuyMode ? groupedOffers[0].premium : premium);
      const transaction = prepareContractCall({
        contract: usdcContract,
        method: "function approve(address spender, uint256 amount) external returns (bool)",
        params: [CDS_MANAGER_ADDRESS, amount],
      });
      await sendTx(transaction);
      setIsApproved(true);
      // showNotification("USDC approved successfully", "success");
      console.log("USDC approved successfully");
    } catch (error) {
      console.error("Error approving USDC:", error);
      // showNotification("Failed to approve USDC", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateInterestRate = () => {
    const nextCouponAmount = Number(bondInfo.nextCouponAmount) / 1e6;
    const interest = nextCouponAmount - 100;
    return (interest / 100 * 100).toFixed(2);
  };

  return (
    <div className="bg-app-light rounded-lg shadow-lg overflow-hidden w-full xs:w-[360px] sm:w-[440px] md:w-[440px] lg:w-[400px] xl:w-[380px] h-[610px] flex flex-col">
      <div className="p-4 flex-grow">
        <h2 className="text-xl font-bold text-app-primary-2 mb-4">CDS Order Book</h2>
        
        {/* Bond Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <InfoCard
            icon={<DollarSquareIcon className="h-5 w-5 text-app-primary-2" />}
            title="Collateral"
            value={`${(Number(bondInfo.nextCouponAmount) / 1e6).toFixed(2)} USDC`}
          />
          <InfoCard
            icon={<Calendar03Icon className="h-5 w-5 text-app-primary-2" />}
            title="Next Payment"
            value={new Date(bondInfo.nextCouponDate * 1000).toLocaleDateString()}
          />
          <InfoCard
            icon={<PercentSquareIcon className="h-5 w-5 text-app-primary-2" />}
            title="Interest"
            value={`${calculateInterestRate()}%`}
          />
          <InfoCard
            icon={<DiplomaIcon className="h-5 w-5 text-app-primary-2" />}
            title="Bond"
            value={truncateAddress(bondInfo.bondTokenAddress)}
          />
        </div>

        {/* Order Book */}
        <div className="mb-4 mt-6 relative">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-app-primary-2">Order Book</h3>
            <InformationSquareIcon 
              className="h-5 w-5 text-app-primary-2 cursor-help"
              title="CDS Offers"
            />
          </div>
          <OrderBookTable groupedOffers={groupedOffers} onBuy={handleBuyCDS} isBuyMode={isBuyMode} />
        </div>

        {/* Mode Toggle and Premium Input */}
        <div className="space-y-3">
          <ModeToggle isBuyMode={isBuyMode} setIsBuyMode={setIsBuyMode} />
          {!isBuyMode && (
            <PremiumInput premium={premium} setPremium={setPremium} />
          )}
        </div>

        {/* Action Button */}
        <div className="p-4 bg-app-dark-mint bg-opacity-20">
          {!isApproved ? (
            <TransactionButton
              contractAddress={MOCK_USDC_ADDRESS}
              transaction={handleApprove}
              className="w-full text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors duration-300 bg-app-primary-2 hover:bg-app-primary-1"
            >
              Approve USDC
            </TransactionButton>
          ) : (
            <TransactionButton
              contractAddress={CDS_MANAGER_ADDRESS}
              transaction={isBuyMode ? () => handleBuyCDS(groupedOffers[0].offers[0].cdsID) : handleCreateCDS}
              className={`w-full text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors duration-300 ${
                isBuyMode ? 'bg-[#4fc484] hover:bg-[#3a9362]' : 'bg-[#f49c4a] hover:bg-[#dc8c42]'
              }`}
            >
              {isBuyMode ? 'Buy Best Offer' : 'Place Offer'}
            </TransactionButton>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; value: string }> = ({ icon, title, value }) => (
  <div className="flex items-center space-x-2 bg-app-dark-mint bg-opacity-30 p-2 rounded-lg">
    {icon}
    <div>
      <p className="text-xs font-medium text-gray-600">{title}</p>
      <p className="text-xs text-app-primary-2">{value}</p>
    </div>
  </div>
);

const OrderBookTable: React.FC<{ groupedOffers: GroupedOffer[], onBuy: (cdsID: number) => void, isBuyMode: boolean }> = ({ groupedOffers, onBuy, isBuyMode }) => (
  <div className="border border-app-primary-2 rounded-lg overflow-hidden bg-white">
    <div className="flex justify-between bg-app-primary-2 px-3 py-2 text-xs font-semibold text-white">
      <span>Premium (USDC)</span>
      <span>Quantity</span>
    </div>
    <div className="h-[128px] overflow-y-auto">
      {groupedOffers.length > 0 ? (
        groupedOffers.map((group) => (
          <div key={group.premium} className="flex justify-between px-3 py-2 text-xs border-b border-gray-200">
            <span>{group.premium}</span>
            <span>{group.offers.length}</span>
            {isBuyMode && (
              <button onClick={() => onBuy(group.offers[0].cdsID)} className="text-app-primary-2 hover:underline">
                Buy
              </button>
            )}
          </div>
        ))
      ) : (
        <p className="p-3 text-center text-gray-500 text-xs">No active offers</p>
      )}
    </div>
  </div>
);

const ModeToggle: React.FC<{ isBuyMode: boolean; setIsBuyMode: (mode: boolean) => void }> = ({ isBuyMode, setIsBuyMode }) => (
  <div className="flex items-center justify-between">
    <span className="font-semibold text-app-primary-2 text-sm">Mode:</span>
    <div className="flex items-center space-x-2">
      <span className={`text-xs ${!isBuyMode ? 'text-[#f49c4a] font-medium' : 'text-gray-500'}`}>Sell</span>
      <button
        onClick={() => setIsBuyMode(!isBuyMode)}
        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isBuyMode ? 'bg-[#4fc484]' : 'bg-[#f49c4a]'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isBuyMode ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
      <span className={`text-xs ${isBuyMode ? 'text-[#1c544e] font-medium' : 'text-gray-500'}`}>Buy</span>
    </div>
  </div>
);

const PremiumInput: React.FC<{ premium: string; setPremium: (value: string) => void }> = ({ premium, setPremium }) => (
  <div className="space-y-2">
    <input
      type="text"
      placeholder="Premium (USDC)"
      value={premium}
      onChange={(e) => setPremium(e.target.value.replace(/[^0-9.]/g, ''))}
      className="w-full p-2 border border-app-primary-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-app-primary-2 bg-white text-app-primary-2 text-sm"
    />
  </div>
);

const truncateAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export default BondOrderBook;
