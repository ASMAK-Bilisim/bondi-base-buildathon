import React, { useState, useEffect, useCallback } from 'react';
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
import { useReadContract, useSendTransaction, useActiveAccount } from 'thirdweb/react';
import { getContract, prepareContractCall, readContract } from 'thirdweb';
import { parseEther, parseUnits } from "viem";
import { useNotifications } from '../../components/contexts/NotificationContext';

interface BondInfo {
  hash: `0x${string}`;
  bondTokenAddress: string;
  nextCouponAmount: string;
  nextCouponDate: number;
  baseName: string;
}

interface BondOrderBookProps {
  bondInfo: BondInfo;
}

interface CDSInfo {
  cdsID: number;
  bondAddressAndExpiration: `0x${string}`;
  creator: string;
  buyer: string;
  premium: string;
  isActive: boolean;
  isClaimed: boolean;
  isAccused: boolean;
}

interface GroupedOffer {
  price: number;
  count: number;
  offers: CDSInfo[];
}

const BondOrderBook: React.FC<BondOrderBookProps> = ({ bondInfo }) => {
  const [cdsOffers, setCdsOffers] = useState<CDSInfo[]>([]);
  const [premium, setPremium] = useState('');
  const [interestRate, setInterestRate] = useState(0);
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isCreatingOffer, setIsCreatingOffer] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isBuyMode, setIsBuyMode] = useState(true);
  const [isBuyApproved, setIsBuyApproved] = useState(false);
  const [isBuyApproving, setIsBuyApproving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const account = useActiveAccount();
  const { addNotification } = useNotifications();

  const [showOwnOffers, setShowOwnOffers] = useState(false);
  const [ownOffers, setOwnOffers] = useState<CDSInfo[]>([]);

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

  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    contract: usdcContract,
    method: "function allowance(address owner, address spender) view returns (uint256)",
    params: [account?.address || '0x', CDS_MANAGER_ADDRESS],
  });

  useEffect(() => {
    if (allowanceData) {
      const allowance = BigInt(allowanceData);
      const collateralAmount = BigInt(bondInfo.nextCouponAmount);
      setIsApproved(allowance >= collateralAmount);
    }
  }, [allowanceData, bondInfo.nextCouponAmount]);

  useEffect(() => {
    const faceValue = parseEther("100");
    const fullPaymentAmount = BigInt(bondInfo.nextCouponAmount);
    const couponAmount = fullPaymentAmount - faceValue;

    // Calculate interest rate
    const rate = Number(couponAmount) * 10000 / Number(faceValue) / 100;
    setInterestRate(rate);
  }, [bondInfo]);

  useEffect(() => {
    if (account?.address && cdsOffers.length > 0) {
      const userOffers = cdsOffers.filter(offer => offer.creator.toLowerCase() === account.address.toLowerCase());
      setOwnOffers(userOffers);
    }
  }, [account?.address, cdsOffers]);

  const handleApprove = async () => {
    if (!account?.address) return;
    setIsApproving(true);
    try {
      const collateralAmount = BigInt(bondInfo.nextCouponAmount);
      const transaction = await prepareContractCall({
        contract: usdcContract,
        method: "function approve(address spender, uint256 amount) external returns (bool)",
        params: [CDS_MANAGER_ADDRESS, collateralAmount],
      });
      await sendTx(transaction as any);
      await refetchAllowance();
      addNotification({
        title: "Approval Successful",
        message: "USDC spending approved for creating CDS offer.",
      });
    } catch (error) {
      console.error("Error approving USDC:", error);
      addNotification({
        title: "Approval Failed",
        message: `Error approving USDC: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleCreateOffer = async () => {
    if (!account?.address) {
      addNotification({
        title: "Action Required",
        message: "Please connect your wallet to create an offer",
      });
      return;
    }

    setIsCreatingOffer(true);
    try {
      // Convert premium from USDC (6 decimals) to wei (18 decimals)
      const premiumInWei = parseUnits(premium, 6);

      const tx = await prepareContractCall({
        contract: cdsManagerContract,
        method: "function createCDS(bytes32 bondAddressAndExpiration, uint256 premium) external returns (uint256)",
        params: [bondInfo.hash, premiumInWei],
      });

      const result = await sendTx(tx as any);
      
      console.log("Offer creation transaction:", JSON.stringify(result, (_, v) => typeof v === 'bigint' ? v.toString() : v));

      addNotification({
        title: "Offer Created",
        message: `Your CDS offer of ${premium} USDC has been created successfully!`,
      });
      setPremium('');

      // Refresh the CDS offers list
      fetchCDSOffers();
    } catch (error) {
      console.error("Error creating offer:", error);
      addNotification({
        title: "Offer Creation Failed",
        message: `Error creating offer: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsCreatingOffer(false);
    }
  };

  const handleBuyApprove = async () => {
    if (!account?.address) return;
    setIsBuyApproving(true);
    try {
      const sortedOffers = groupOffersByPrice(cdsOffers);
      if (sortedOffers.length === 0) {
        throw new Error("No offers available");
      }
      const cheapestOffer = sortedOffers[0].offers[0];
      const premium = parseEther(cheapestOffer.premium);

      const transaction = await prepareContractCall({
        contract: usdcContract,
        method: "function approve(address spender, uint256 amount) external returns (bool)",
        params: [CDS_MANAGER_ADDRESS, premium],
      });
      await sendTx(transaction as any);

      console.log("USDC approval for buy successful");
      setIsBuyApproved(true);
      addNotification({
        title: "Approval Successful",
        message: `USDC spending of ${cheapestOffer.premium} approved for buying CDS.`,
      });
    } catch (error) {
      console.error("Error approving USDC for buy:", error);
      addNotification({
        title: "Approval Failed",
        message: `Error approving USDC: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsBuyApproving(false);
    }
  };

  const handleBuyCDS = async () => {
    if (!account?.address) {
      addNotification({
        title: "Action Required",
        message: "Please connect your wallet to buy a CDS",
      });
      return;
    }
    setIsBuying(true);
    try {
      if (cdsOffers.length === 0) throw new Error("No offers available");
      const tx = await prepareContractCall({
        contract: getContract({
          client,
          address: CDS_MANAGER_ADDRESS,
          abi: cdsManagerABI,
          chain: baseSepolia,
        }),
        method: "function buyCDS(uint256 cdsID) external returns (bool)",
        params: [BigInt(cdsOffers[0].cdsID)],
      });

      const result = await sendTx(tx as any);
      
      console.log("Buy CDS transaction:", JSON.stringify(result, (_, v) => typeof v === 'bigint' ? v.toString() : v));

      addNotification({
        title: "Purchase Successful",
        message: `CDS purchased successfully for ${cdsOffers[0].premium} USDC!`,
      });
      
      // Refresh the CDS offers list
      fetchCDSOffers();
    } catch (error) {
      console.error("Error buying CDS:", error);
      addNotification({
        title: "Purchase Failed",
        message: `Error buying CDS: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsBuying(false);
      setIsBuyApproved(false);
    }
  };

  const groupOffersByPrice = (offers: CDSInfo[]): GroupedOffer[] => {
    const groupedOffers = offers.reduce((acc: { [key: number]: GroupedOffer }, offer) => {
      if (offer.creator.toLowerCase() === account?.address?.toLowerCase()) {
        return acc;
      }

      const price = Math.floor(parseFloat(offer.premium));
      if (!acc[price]) {
        acc[price] = { price, count: 0, offers: [] };
      }
      acc[price].count += 1;
      acc[price].offers.push(offer);
      return acc;
    }, {});

    return Object.values(groupedOffers)
      .sort((a, b) => a.price - b.price);
  };

  const fetchCDSOffers = useCallback(async () => {
    if (cdsCount) {
      setIsFetching(true);
      const offers = [];
      for (let i = 1; i <= Number(cdsCount); i++) {
        try {
          const cdsData = await readContract({
            contract: cdsManagerContract,
            method: "function cdsContracts(uint256) view returns (uint256, bytes32, address, address, uint256, bool, bool, bool)",
            params: [BigInt(i)],
          });
          
          if (cdsData && 
              cdsData[1] === bondInfo.hash && 
              cdsData[5] &&  // isActive
              cdsData[3] === '0x0000000000000000000000000000000000000000') { // buyer is zero address
            offers.push({
              cdsID: Number(cdsData[0]),
              bondAddressAndExpiration: cdsData[1],
              creator: cdsData[2],
              buyer: cdsData[3],
              premium: (Number(cdsData[4]) / 1e6).toString(), // Convert from wei to USDC
              isActive: cdsData[5],
              isClaimed: cdsData[6],
              isAccused: cdsData[7],
            });
          }
        } catch (error) {
          console.error(`Error fetching CDS offer ${i}:`, error);
        }
      }
      setCdsOffers(offers);
      setIsFetching(false);
    }
  }, [cdsCount, bondInfo.hash, cdsManagerContract]);

  useEffect(() => {
    fetchCDSOffers();
  }, [fetchCDSOffers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      parts.pop();
    }
    setPremium(parts.join('.'));
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 13) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
            value={bondInfo.baseName}
            tooltip={truncateAddress(bondInfo.bondTokenAddress)}
            fullAddress={bondInfo.bondTokenAddress}  // Pass the full address here
          />
        </div>

        <div className="mb-4 mt-6 relative">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-app-primary-2">Order Book</h3>
            <div className="relative">
              <InformationSquareIcon 
                className="h-5 w-5 text-app-primary-2 cursor-help"
                onMouseEnter={() => setShowOwnOffers(true)}
                onMouseLeave={() => setShowOwnOffers(false)}
              />
              {showOwnOffers && (
                <OwnOffersTooltip ownOffers={ownOffers} />
              )}
            </div>
          </div>
          <OrderBook
            groupedOffers={groupOffersByPrice(cdsOffers)}
            isFetching={isFetching}
          />
        </div>

        <div className="space-y-3">
          <ModeToggle isBuyMode={isBuyMode} setIsBuyMode={setIsBuyMode} />
          {!isBuyMode && (
            <PremiumInput
              premium={premium}
              handleInputChange={handleInputChange}
            />
          )}
        </div>
      </div>

      <div className="p-4 bg-app-dark-mint bg-opacity-20">
        <ActionButton
          isBuyMode={isBuyMode}
          isBuyApproved={isBuyApproved}
          isApproved={isApproved}
          handleBuyCDS={handleBuyCDS}
          handleBuyApprove={handleBuyApprove}
          handleCreateOffer={handleCreateOffer}
          handleApprove={handleApprove}
          isBuying={isBuying}
          isBuyApproving={isBuyApproving}
          isCreatingOffer={isCreatingOffer}
          isApproving={isApproving}
          cdsOffers={cdsOffers}
          premium={premium}
          bondInfo={bondInfo}
        />
      </div>
    </div>
  );
};

// Helper components

const InfoCard: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  value: string;
  tooltip?: string;
  fullAddress?: string;  // Add this new prop
}> = ({ icon, title, value, tooltip, fullAddress }) => {
  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fullAddress) {  // Use fullAddress instead of tooltip
      window.open(`https://sepolia.basescan.org/address/${fullAddress}`, '_blank');
    }
  };

  return (
    <div className="flex items-center space-x-2 bg-app-dark-mint bg-opacity-30 p-2 rounded-lg relative">
      {icon}
      <div>
        <p className="text-xs font-medium text-gray-600">{title}</p>
        <p className="text-[10px] text-app-primary-2">{value}</p>
      </div>
      {tooltip && (
        <div className="absolute top-1 right-1 group">
          <InformationSquareIcon 
            className="h-4 w-4 text-app-primary-2 cursor-pointer hover:text-app-primary-1" 
            onClick={handleIconClick}
          />
          <span className="absolute hidden group-hover:block right-0 bg-white border border-app-primary-2 text-app-primary-2 text-xs rounded p-1 mt-1 whitespace-nowrap">
            {tooltip}
          </span>
        </div>
      )}
    </div>
  );
};

const OwnOffersTooltip: React.FC<{ ownOffers: CDSInfo[] }> = ({ ownOffers }) => (
  <div className="absolute right-0 mt-2 p-3 bg-white border border-app-primary-2 rounded-lg shadow-lg z-10 w-80">
    <p className="text-xs font-semibold text-app-primary-2 mb-2">Your own offers are hidden from you in the order book.</p>
    {ownOffers.length > 0 ? (
      <ul className="text-xs text-[#071f1e] space-y-1">
        {ownOffers.map((offer, index) => (
          <li key={index} className="p-1 border border-app-primary-2 border-opacity-20 rounded flex justify-between items-center">
            <span>CDS ID: {offer.cdsID}</span>
            <span className="text-right">Premium: {offer.premium} USDC</span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-xs text-[#071f1e]">You have no active offers.</p>
    )}
  </div>
);

const OrderBook: React.FC<{ groupedOffers: GroupedOffer[]; isFetching: boolean }> = ({ groupedOffers, isFetching }) => (
  <div className="border border-app-primary-2 rounded-lg overflow-hidden bg-white"> 
    <div className="flex justify-between bg-app-primary-2 px-3 py-2 text-xs font-semibold text-white">
      <span>Price (USDC)</span>
      <span>Offers</span>
    </div>
    <div className="h-[128px] overflow-y-auto">
      {groupedOffers.length > 0 ? (
        groupedOffers.map((groupedOffer, index) => (
          <OrderBookEntry 
            key={index} 
            groupedOffer={groupedOffer} 
            isBestOffer={index === 0}
          />
        ))
      ) : (
        <p className="p-3 text-center text-gray-500 text-xs">
          {isFetching ? "Fetching offers..." : "No active offers"}
        </p>
      )}
    </div>
  </div>
);

const OrderBookEntry: React.FC<{ groupedOffer: GroupedOffer; isBestOffer: boolean }> = ({ groupedOffer, isBestOffer }) => (
  <div 
    className={`
      flex justify-between items-center py-2 px-3 text-xs
      ${isBestOffer ? 'bg-[#d8feaa] bg-opacity-20' : ''}
    `}
  >
    <span className={`font-medium ${isBestOffer ? 'text-app-primary-2' : 'text-gray-700'}`}>
      {groupedOffer.price}
    </span>
    <span className="text-gray-600">{groupedOffer.count}</span>
  </div>
);

const ModeToggle: React.FC<{ isBuyMode: boolean; setIsBuyMode: React.Dispatch<React.SetStateAction<boolean>> }> = ({ isBuyMode, setIsBuyMode }) => (
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

const PremiumInput: React.FC<{ premium: string; handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ premium, handleInputChange }) => (
  <div className="space-y-2">
    <input
      type="text"
      placeholder="Premium (USDC)"
      value={premium}
      onChange={handleInputChange}
      className="w-full p-2 border border-app-primary-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-app-primary-2 bg-white text-app-primary-2 text-sm"
    />
  </div>
);

const ActionButton: React.FC<{
  isBuyMode: boolean;
  isBuyApproved: boolean;
  isApproved: boolean;
  handleBuyCDS: () => Promise<void>;
  handleBuyApprove: () => Promise<void>;
  handleCreateOffer: () => Promise<void>;
  handleApprove: () => Promise<void>;
  isBuying: boolean;
  isBuyApproving: boolean;
  isCreatingOffer: boolean;
  isApproving: boolean;
  cdsOffers: CDSInfo[];
  premium: string;
  bondInfo: BondInfo;
}> = ({
  isBuyMode,
  isBuyApproved,
  isApproved,
  handleBuyCDS,
  handleBuyApprove,
  handleCreateOffer,
  handleApprove,
  isBuying,
  isBuyApproving,
  isCreatingOffer,
  isApproving,
  cdsOffers,
  premium,
  bondInfo,
}) => {
  if (isBuyMode) {
    return isBuyApproved ? (
      <button
        onClick={handleBuyCDS}
        disabled={isBuying || cdsOffers.length === 0}
        className="w-full bg-[#4fc484] text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-[#3a9362] transition-colors duration-300 disabled:bg-opacity-50 disabled:cursor-not-allowed border border-[#1c544e] border-opacity-20"
      >
        {isBuying ? 'Buying...' : 'Buy Best Offer'}
      </button>
    ) : (
      <button
        onClick={handleBuyApprove}
        disabled={isBuyApproving || cdsOffers.length === 0}
        className="w-full bg-[#4fc484] text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-[#3a9362] transition-colors duration-300 disabled:bg-opacity-50 disabled:cursor-not-allowed border border-[#1c544e] border-opacity-20"
      >
        {isBuyApproving ? 'Authorizing...' : 'Authorize Spending'}
      </button>
    );
  } else {
    return isApproved ? (
      <button
        onClick={handleCreateOffer}
        disabled={isCreatingOffer || !premium || parseFloat(premium) === 0}
        className="w-full bg-[#f49c4a] text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-[#dc8c42] transition-colors duration-300 disabled:bg-opacity-50 disabled:cursor-not-allowed border border-white border-opacity-20"
      >
        {isCreatingOffer ? 'Placing Offer...' : 'Place Offer'}
      </button>
    ) : (
      <button
        onClick={handleApprove}
        disabled={isApproving}
        className="w-full bg-[#f49c4a] text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-[#dc8c42] transition-colors duration-300 disabled:bg-opacity-50 disabled:cursor-not-allowed border border-white border-opacity-20"
      >
        {isApproving ? 'Authorizing...' : 'Authorize Collateral'}
      </button>
    );
  }
};

export default BondOrderBook;