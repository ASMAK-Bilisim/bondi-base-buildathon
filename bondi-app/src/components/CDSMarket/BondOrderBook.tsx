import React, { useState, useEffect } from 'react';
import { useContract, useContractWrite, useAddress, useContractRead, useSDK } from "@thirdweb-dev/react";
import { ethers } from 'ethers';
import { MOCK_USDC_ADDRESS, mockUsdcABI, CDS_MANAGER_ADDRESS, cdsManagerABI } from '../../constants/contractInfo';
import Modal from '../../components/common/Modal';
import { DollarSquareIcon, Calendar03Icon, PercentSquareIcon, DiplomaIcon } from '@hugeicons/react';

interface BondInfo {
  hash: string;
  bondTokenAddress: string;
  nextCouponAmount: string;
  nextCouponDate: number;
}

interface BondOrderBookProps {
  bondInfo: BondInfo;
}

interface GroupedOffer {
  price: number;
  count: number;
  offers: any[];
}

const BondOrderBook: React.FC<BondOrderBookProps> = ({ bondInfo }) => {
  const [cdsOffers, setCdsOffers] = useState<any[]>([]);
  const [premium, setPremium] = useState('');
  const [exceedsCoupon, setExceedsCoupon] = useState(false);
  const [interestRate, setInterestRate] = useState(0);
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isCreatingOffer, setIsCreatingOffer] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isBuyMode, setIsBuyMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isBuyApproved, setIsBuyApproved] = useState(false);
  const [isBuyApproving, setIsBuyApproving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const address = useAddress();
  const sdk = useSDK();

  const { contract: usdcContract } = useContract(MOCK_USDC_ADDRESS, mockUsdcABI);
  const { mutateAsync: approveUSDC } = useContractWrite(usdcContract, "approve");

  const { contract: cdsManagerContract } = useContract(CDS_MANAGER_ADDRESS, cdsManagerABI);
  const { mutateAsync: createCDS } = useContractWrite(cdsManagerContract, "createCDS");
  const { mutateAsync: buyCDS } = useContractWrite(cdsManagerContract, "buyCDS");

  const { data: cdsCount } = useContractRead(cdsManagerContract, "cdsCount");

  const { data: allowanceData, isLoading: isAllowanceLoading, refetch: refetchAllowance } = useContractRead(
    usdcContract,
    "allowance",
    [address, CDS_MANAGER_ADDRESS]
  );

  useEffect(() => {
    if (allowanceData && !isAllowanceLoading) {
      const allowance = ethers.BigNumber.from(allowanceData);
      const collateralAmount = ethers.BigNumber.from(bondInfo.nextCouponAmount);
      setIsApproved(allowance.gte(collateralAmount));
    }
  }, [allowanceData, isAllowanceLoading, bondInfo.nextCouponAmount]);

  useEffect(() => {
    const faceValue = ethers.utils.parseUnits("100", 6);
    const fullPaymentAmount = ethers.BigNumber.from(bondInfo.nextCouponAmount);
    const couponAmount = fullPaymentAmount.sub(faceValue);

    // Calculate interest rate
    const rate = couponAmount.mul(10000).div(faceValue).toNumber() / 100;
    setInterestRate(rate);
  }, [bondInfo]);

  useEffect(() => {
    if (premium) {
      const premiumInWei = ethers.utils.parseUnits(premium, 6);
      const couponAmount = ethers.BigNumber.from(bondInfo.nextCouponAmount).sub(ethers.utils.parseUnits("100", 6));
      setExceedsCoupon(premiumInWei.gt(couponAmount));
    } else {
      setExceedsCoupon(false);
    }
  }, [premium, bondInfo.nextCouponAmount]);

  const handleApprove = async () => {
    if (!address) return;
    setIsApproving(true);
    try {
      const collateralAmount = ethers.BigNumber.from(bondInfo.nextCouponAmount);
      await approveUSDC({ args: [CDS_MANAGER_ADDRESS, collateralAmount] });
      await refetchAllowance();
    } catch (error) {
      console.error("Error approving USDC:", error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleCreateOffer = async () => {
    if (!address) {
      alert("Please connect your wallet to create an offer");
      return;
    }

    setIsCreatingOffer(true);
    try {
      const offerTx = await createCDS({ 
        args: [
          bondInfo.hash,
          ethers.utils.parseUnits(premium, 6).toString()
        ]
      });
      console.log("Offer creation transaction:", JSON.stringify(offerTx, (_, v) => typeof v === 'bigint' ? v.toString() : v));

      setModalMessage('Offer created successfully!');
      setIsModalOpen(true);
      setPremium('');
    } catch (error) {
      console.error("Error creating offer:", error);
      alert("There was an error creating your offer. Please try again.");
    } finally {
      setIsCreatingOffer(false);
    }
  };

  const handleSwitchMode = () => {
    setIsBuyMode(!isBuyMode);
  };

  const handleBuyApprove = async () => {
    if (!address) return;
    setIsBuyApproving(true);
    try {
      const sortedOffers = groupOffersByPrice(cdsOffers);
      if (sortedOffers.length === 0) {
        throw new Error("No offers available");
      }
      const cheapestOffer = sortedOffers[0].offers[0];
      const premium = cheapestOffer.premium;

      const approveTx = await approveUSDC({ args: [CDS_MANAGER_ADDRESS, premium] });
      await sdk?.getProvider().waitForTransaction(approveTx.receipt.transactionHash);

      console.log("USDC approval for buy successful");
      setIsBuyApproved(true);
    } catch (error) {
      console.error("Error approving USDC for buy:", error);
      setModalMessage(`Error approving USDC: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsModalOpen(true);
    } finally {
      setIsBuyApproving(false);
    }
  };

  const removePurchasedOffer = (purchasedCdsID: number) => {
    setCdsOffers(prevOffers => prevOffers.filter(offer => offer.cdsID !== purchasedCdsID));
  };

  const handleBuyCDS = async () => {
    if (!address) {
      alert("Please connect your wallet to buy a CDS");
      return;
    }
    setIsBuying(true);
    try {
      const sortedOffers = groupOffersByPrice(cdsOffers);
      if (sortedOffers.length === 0) {
        throw new Error("No offers available");
      }

      let buySuccessful = false;
      let attemptedOffers = 0;

      while (!buySuccessful && attemptedOffers < sortedOffers[0].offers.length) {
        const offer = sortedOffers[0].offers[attemptedOffers];
        const cdsID = offer.cdsID;

        // Check if the offer is not created by the current user
        if (offer.creator.toLowerCase() !== address.toLowerCase()) {
          try {
            // Now, try to buy the CDS
            const buyTx = await buyCDS({ args: [cdsID] });
            await sdk?.getProvider().waitForTransaction(buyTx.receipt.transactionHash);

            console.log("CDS purchase transaction:", JSON.stringify(buyTx, (_, v) => typeof v === 'bigint' ? v.toString() : v));

            buySuccessful = true;
            // Remove the purchased offer from the local state
            setCdsOffers(prevOffers => prevOffers.filter(offer => offer.cdsID !== cdsID));
            
            setModalMessage('CDS purchased successfully!');
            setIsModalOpen(true);
          } catch (error: any) {
            if (error.message.includes("CDS already sold")) {
              console.log(`CDS ${cdsID} already sold, trying next offer`);
              // Remove the sold offer from the order book
              removePurchasedOffer(cdsID);
            } else {
              throw error;
            }
          }
        } else {
          console.log(`Skipping own offer with CDS ID ${cdsID}`);
        }
        attemptedOffers++;
      }

      if (!buySuccessful) {
        throw new Error("No available offers to buy");
      }

    } catch (error: any) {
      console.error("Error buying CDS:", error);
      setModalMessage(`Error buying CDS: ${error.message}`);
      setIsModalOpen(true);
    } finally {
      setIsBuying(false);
      setIsBuyApproved(false);  // Reset approval state after purchase attempt
    }
  };

  const groupOffersByPrice = (offers: any[]): GroupedOffer[] => {
    const groupedOffers = offers.reduce((acc, offer) => {
      const price = Math.floor(parseFloat(ethers.utils.formatUnits(offer.premium, 6))); // Round down to nearest integer
      if (!acc[price]) {
        acc[price] = { count: 0, offers: [] };
      }
      acc[price].count += 1;
      acc[price].offers.push({
        ...offer,
        isOwnOffer: offer.creator.toLowerCase() === address?.toLowerCase()
      });
      return acc;
    }, {});

    return Object.entries(groupedOffers)
      .map(([price, data]: [string, any]) => ({
        price: parseInt(price),
        count: data.count,
        offers: data.offers.sort((a: any, b: any) => a.cdsID - b.cdsID) // Sort offers by CDS ID (assuming lower ID means older offer)
      }))
      .filter(group => group.offers.length > 0) // Remove groups with no offers
      .sort((a, b) => a.price - b.price);
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 13) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    const fetchCDSOffers = async () => {
      if (cdsCount && cdsManagerContract) {
        setIsFetching(true);
        const offers = [];
        for (let i = 1; i <= cdsCount.toNumber(); i++) {
          try {
            const cdsData = await cdsManagerContract.call("cdsContracts", [i]);
            if (cdsData && 
                cdsData.bondAddressAndExpiration === bondInfo.hash && 
                cdsData.isActive &&
                cdsData.buyer === ethers.constants.AddressZero) { // Check if the CDS is not bought
              offers.push({
                cdsID: cdsData.cdsID.toNumber(),
                bondAddressAndExpiration: cdsData.bondAddressAndExpiration,
                creator: cdsData.creator,
                buyer: cdsData.buyer,
                premium: cdsData.premium.toString(),
                isActive: cdsData.isActive,
                isClaimed: cdsData.isClaimed,
                isAccused: cdsData.isAccused,
              });
            }
          } catch (error) {
            console.error(`Error fetching CDS offer ${i}:`, error);
          }
        }
        setCdsOffers(offers);
        
        // Set a timeout to change isFetching to false after 10 seconds
        setTimeout(() => {
          setIsFetching(false);
        }, 10000);
      }
    };

    fetchCDSOffers();
  }, [cdsCount, bondInfo.hash, cdsManagerContract]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow digits
    setPremium(value);
  };

  return (
    <div className="bg-app-light rounded-lg shadow-lg overflow-hidden w-full xs:w-[360px] sm:w-[440px] md:w-[440px] lg:w-[400px] xl:w-[380px] h-[610px] flex flex-col">
      <div className="p-4 flex-grow">
        <h2 className="text-xl font-bold text-app-primary-2 mb-4">CDS Order Book</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center space-x-2 bg-app-dark-mint bg-opacity-30 p-2 rounded-lg">
            <DollarSquareIcon className="h-5 w-5 text-app-primary-2" />
            <div>
              <p className="text-xs font-medium text-gray-600">Collateral</p>
              <p className="text-xs text-app-primary-2">{ethers.utils.formatUnits(bondInfo.nextCouponAmount, 6)} USDC</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-app-dark-mint bg-opacity-30 p-2 rounded-lg">
            <Calendar03Icon className="h-5 w-5 text-app-primary-2" />
            <div>
              <p className="text-xs font-medium text-gray-600">Next Payment</p>
              <p className="text-xs text-app-primary-2">{new Date(bondInfo.nextCouponDate * 1000).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-app-dark-mint bg-opacity-30 p-2 rounded-lg">
            <PercentSquareIcon className="h-5 w-5 text-app-primary-2" />
            <div>
              <p className="text-xs font-medium text-gray-600">Interest</p>
              <p className="text-xs text-app-primary-2">{interestRate.toFixed(2)}%</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-app-dark-mint bg-opacity-30 p-2 rounded-lg">
            <DiplomaIcon className="h-5 w-5 text-app-primary-2" />
            <div>
              <p className="text-xs font-medium text-gray-600">Bond</p>
              <p className="text-xs text-app-primary-2">{truncateAddress(bondInfo.bondTokenAddress)}</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-app-primary-2 mb-2">Order Book</h3>
          <div className="border border-app-primary-2 rounded-lg overflow-hidden bg-white"> 
            <div className="flex justify-between bg-app-primary-2 px-3 py-2 text-xs font-semibold text-white">
              <span>Price (USDC)</span>
              <span>Offers</span>
            </div>
            <div className="h-[128px] overflow-y-auto">
              {groupOffersByPrice(cdsOffers).length > 0 ? (
                groupOffersByPrice(cdsOffers).map((groupedOffer, index) => (
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
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-app-primary-2 text-sm">Mode:</span>
            <div className="flex items-center space-x-2">
              <span className={`text-xs ${!isBuyMode ? 'text-[#f49c4a] font-medium' : 'text-gray-500'}`}>Sell</span>
              <button
                onClick={handleSwitchMode}
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

          {!isBuyMode && (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Premium (USDC)"
                value={premium}
                onChange={handleInputChange}
                className="w-full p-2 border border-app-primary-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-app-primary-2 bg-white text-app-primary-2 text-sm"
              />
              {exceedsCoupon && (
                <p className="text-app-credit-30 text-xs">
                  Warning: Your premium exceeds the coupon amount.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-app-dark-mint bg-opacity-20">
        {isBuyMode ? (
          isBuyApproved ? (
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
          )
        ) : (
          isApproved ? (
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
          )
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h3 className="text-lg font-bold text-app-primary-2 mb-4">Transaction Status</h3>
        <p className="text-gray-600 mb-6 text-sm">{modalMessage}</p>
        <button
          onClick={() => setIsModalOpen(false)}
          className="w-full bg-app-primary-2 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors duration-300"
        >
          Close
        </button>
      </Modal>
    </div>
  );
};

interface OrderBookEntryProps {
  groupedOffer: GroupedOffer;
  isBestOffer: boolean;
}

const OrderBookEntry: React.FC<OrderBookEntryProps> = ({ groupedOffer, isBestOffer }) => {
  const hasOwnOffer = groupedOffer.offers.some(offer => offer.isOwnOffer);
  
  return (
    <div 
      className={`
        flex justify-between items-center py-2 px-3 text-xs relative
        ${isBestOffer ? 'bg-[#d8feaa] bg-opacity-20' : ''}
        ${hasOwnOffer ? 'bg-[#f49c4a] bg-opacity-20' : ''}
      `}
    >
      <span className={`font-medium ${isBestOffer ? 'text-app-primary-2' : 'text-gray-700'}`}>
        {groupedOffer.price}
      </span>
      <span className="text-gray-600">{groupedOffer.count}</span>
      {hasOwnOffer && (
        <span className="absolute inset-0 flex items-center justify-center text-[#f49c4a] font-medium text-xs">
          (Your offer)
        </span>
      )}
    </div>
  );
};

export default BondOrderBook;