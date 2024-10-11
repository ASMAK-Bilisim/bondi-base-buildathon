import React, { useState, useEffect } from 'react';
import { format, parseISO, isBefore } from 'date-fns';
import { LinkSquare02Icon, CheckmarkBadge02Icon, SquareLock01Icon } from '@hugeicons/react';
import Button from '../common/Button';
import { useAddress, useContract, useContractWrite, useContractRead } from "@thirdweb-dev/react";
import { ethers } from 'ethers';
import { BOND_CONTRACT_ADDRESS, contractABI } from '../../constants/contractInfo';
import TearingCoupon from './TearingCoupon';
import { animated, useTransition } from 'react-spring';

interface Coupon {
  id: string;
  date: string;
  amount: number;
  isRedeemed: boolean;
}

interface BondCouponTimelineProps {
  tokenName: string;
  coupons: Coupon[];
  contractAddress: string;
}

const SerratedCoupon: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return (
    <div className={`relative w-full h-full ${className}`} {...props}>
      <svg className="absolute left-0 top-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d="M0 0 L2.5 5 L0 10 L2.5 15 L0 20 L2.5 25 L0 30 L2.5 35 L0 40 L2.5 45 L0 50 L2.5 55 L0 60 L2.5 65 L0 70 L2.5 75 L0 80 L2.5 85 L0 90 L2.5 95 L0 100
             L100 100 L97.5 95 L100 90 L97.5 85 L100 80 L97.5 75 L100 70 L97.5 65 L100 60 L97.5 55 L100 50 L97.5 45 L100 40 L97.5 35 L100 30 L97.5 25 L100 20 L97.5 15 L100 10 L97.5 5 L100 0 Z"
          fill="currentColor"
        />
      </svg>
      <div className="relative z-10 h-full p-4">{children}</div>
    </div>
  );
};

const BondCouponTimeline: React.FC<BondCouponTimelineProps> = ({
  tokenName,
  coupons,
  contractAddress,
}) => {
  const currentDate = new Date();
  const [redeemedCoupons, setRedeemedCoupons] = useState<string[]>([]);
  const [tearingCouponId, setTearingCouponId] = useState<string | null>(null);
  const [hasInvested, setHasInvested] = useState(false);
  const [investedAmount, setInvestedAmount] = useState<string>('0.00');
  const address = useAddress();
  const { contract: bondContract } = useContract(contractAddress, contractABI);
  const { mutateAsync: redeemCoupon, isLoading } = useContractWrite(bondContract, "redeemCoupon");

  const { data: investedAmountData, isLoading: isInvestedAmountLoading, refetch: refetchInvestedAmount } = useContractRead(
    bondContract,
    "investedAmountPerInvestor",
    [address]
  );

  useEffect(() => {
    if (address) {
      refetchInvestedAmount();
    }
  }, [address, refetchInvestedAmount]);

  useEffect(() => {
    if (investedAmountData) {
      const formattedInvestedAmount = ethers.utils.formatUnits(investedAmountData.investedAmount.toString(), 6);
      setInvestedAmount(formattedInvestedAmount);
      setHasInvested(parseFloat(formattedInvestedAmount) > 0);
    }
  }, [investedAmountData]);

  const handleRedeemCoupon = async (couponId: string, amount: number) => {
    if (!address) {
      alert("Please connect your wallet to redeem coupons.");
      return;
    }

    console.log(`Starting redemption for coupon ${couponId}`);
    setTearingCouponId(couponId);

    // Simulate contract call for now
    console.log(`Redeeming coupon ${couponId} for amount ${amount}`);
    // Uncomment the following line when ready to make actual contract calls
    // const data = await redeemCoupon({ args: [couponId, ethers.utils.parseUnits(amount.toString(), 6)] });
    // console.info("Contract call success", data);
  };

  const handleTearComplete = (couponId: string) => {
    console.log(`Tear complete for coupon ${couponId}`);
    setRedeemedCoupons(prev => [...prev, couponId]);
    setTearingCouponId(null);
  };

  const transitions = useTransition(coupons, {
    keys: coupon => coupon.id,
    from: { opacity: 0, transform: 'translateX(50px)' },
    enter: { opacity: 1, transform: 'translateX(0px)' },
    leave: { opacity: 0, transform: 'translateX(-50px)' },
  });

  if (!hasInvested) {
    return null; // Don't render anything if the user hasn't invested
  }

  return (
    <div className="bg-[#f2fbf9] rounded-lg shadow-md font-inter relative overflow-hidden">
      <div className="flex relative z-10">
        {/* Static left section with increased width */}
        <div className="w-64 flex-shrink-0 flex flex-col justify-center items-center pr-4 bg-[#f2fbf9] relative z-20">
          <h2 className="text-[32px] font-bold text-[#1c544e]">{tokenName}</h2>
          {/* LinkSquare02Icon positioned in the left section */}
          <div className="absolute top-4 right-4">
            <LinkSquare02Icon 
              className="cursor-pointer hover:scale-110 transition-all duration-200 ease-in-out" 
              size={24} 
              color="#1c544e"
              variant="stroke"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="w-[2px] bg-gradient-to-b from-transparent via-[#1c544e] to-transparent opacity-30 relative z-20 self-stretch" />

        {/* Scrollable coupons section with gridlines */}
        <div className="flex-grow overflow-x-auto relative py-8 pl-4">
          {/* Gridlines with fade effect */}
          <div className="absolute inset-0 bg-[#1c544e] opacity-5 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-[#f2fbf9] via-transparent to-[#f2fbf9]">
              <div className="w-full h-full" style={{
                backgroundImage: `
                  linear-gradient(to right, #1c544e 1px, transparent 1px),
                  linear-gradient(to bottom, #1c544e 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
              }}></div>
            </div>
          </div>
          
          {/* Top fade */}
          <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#f2fbf9] to-transparent z-10"></div>
          
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#f2fbf9] to-transparent z-10"></div>

          <div className="flex space-x-0.5 relative z-20 pr-6">
            {transitions((style, coupon, _, index) => {
              const couponDate = parseISO(coupon.date);
              const isPastCoupon = isBefore(couponDate, currentDate);
              const isRedeemable = isPastCoupon && !coupon.isRedeemed && !redeemedCoupons.includes(coupon.id);
              const isRedeemed = coupon.isRedeemed || redeemedCoupons.includes(coupon.id);
              const isTearing = tearingCouponId === coupon.id;
              
              const couponContent = (
                <div className="flex-shrink-0 w-72 h-48 relative">
                  {isRedeemed ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="w-16 h-16 bg-[#1c544e] rounded-full flex items-center justify-center mb-2">
                        <CheckmarkBadge02Icon size={32} color="#d4e7e2" variant="solid" />
                      </div>
                      <span className="text-[#1c544e] font-bold text-lg mb-1">Redeemed</span>
                      <span className="text-[#1c544e] text-sm mb-1">{format(couponDate, 'dd MMM yyyy')}</span>
                      <span className="text-[#1c544e] font-bold text-lg">${coupon.amount.toFixed(2)}</span>
                    </div>
                  ) : (
                    <SerratedCoupon className={isRedeemable ? "text-[#1c544e]" : "text-[#a6d9ce]"}>
                      <div className="flex flex-col h-full">
                        <div className="flex-grow px-2">
                          <div className={`absolute top-2 left-4 text-[15px] mt-1 ${isRedeemable ? "text-[#a6d9ce]" : "text-[#1c544e]"}`}>
                            {format(couponDate, 'dd MMM yyyy')}
                          </div>
                          <div className="absolute top-2 right-4">
                            <div className="w-11 h-11 flex items-center justify-center -mt-2 mr-1">
                              <img 
                                src={isRedeemable ? "/assets/turtle-light.png" : "/assets/Turtle.png"}
                                alt={isRedeemable ? "Redeemable" : "Unredeemable"}
                                className="max-w-full max-h-full object-contain transform"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-6 right-6 z-30">
                          <div className="flex justify-between mb-2">
                            <div className="flex flex-col">
                              <span className={`text-[15px] ${isRedeemable ? "text-[#a6d9ce]" : "text-[#1c544e]"}`}>Token Name</span>
                              <span className={`text-[18px] font-bold ${isRedeemable ? "text-[#a6d9ce]" : "text-[#1c544e]"}`}>{tokenName}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className={`text-[15px] ${isRedeemable ? "text-[#a6d9ce]" : "text-[#1c544e]"}`}>Amount</span>
                              <span className={`text-[18px] font-bold ${isRedeemable ? "text-[#a6d9ce]" : "text-[#1c544e]"}`}>${coupon.amount.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="flex justify-center">
                            {isRedeemable ? (
                              <Button
                                intent="secondary"
                                size="large"
                                className="bg-[#d8feaa] text-[#1c544e] hover:bg-[#c2e594] border-none font-extrabold w-full flex items-center justify-center"
                                onClick={() => handleRedeemCoupon(coupon.id, coupon.amount)}
                                disabled={isLoading || isTearing}
                              >
                                {isLoading || isTearing ? "Redeeming..." : "Redeem"}
                              </Button>
                            ) : (
                              <div className="bg-[#1c544e] text-[#a6d9ce] w-full h-10 rounded flex items-center justify-center cursor-not-allowed">
                                <SquareLock01Icon size={24} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </SerratedCoupon>
                  )}
                </div>
              );

              const redeemedContent = (
                <div className="flex flex-col items-center justify-center h-full bg-[#f2fbf9]">
                  <div className="w-16 h-16 bg-[#1c544e] rounded-full flex items-center justify-center mb-2">
                    <CheckmarkBadge02Icon size={32} color="#d4e7e2" variant="solid" />
                  </div>
                  <span className="text-[#1c544e] font-bold text-lg mb-1">Redeemed</span>
                  <span className="text-[#1c544e] text-sm mb-1">{format(couponDate, 'dd MMM yyyy')}</span>
                  <span className="text-[#1c544e] font-bold text-lg">${coupon.amount.toFixed(2)}</span>
                </div>
              );

              return (
                <animated.div
                  key={coupon.id}
                  style={{
                    ...style,
                    zIndex: isTearing ? 50 : coupons.length - index,
                  }}
                  className="relative flex-shrink-0 w-72 h-48"
                >
                  {isTearing ? (
                    <TearingCoupon 
                      onTearComplete={() => handleTearComplete(coupon.id)}
                      redeemedContent={redeemedContent}
                    >
                      {couponContent}
                    </TearingCoupon>
                  ) : (
                    couponContent
                  )}
                </animated.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BondCouponTimeline;