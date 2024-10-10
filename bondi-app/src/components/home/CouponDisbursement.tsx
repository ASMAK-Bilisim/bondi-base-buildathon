import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CouponPercentIcon, LinkSquare01Icon, SquareUnlock01Icon, SquareLock01Icon } from "@hugeicons/react";
import { format, parseISO, isFuture } from 'date-fns';
import { usePrimaryMarketBonds } from "../../hooks/usePrimaryMarketBonds";

interface Coupon {
  id: string;
  date: Date;
  amount: number;
  token: string;
  isRedeemable: boolean;
}

const CouponDisbursement: React.FC = () => {
  const navigate = useNavigate();
  const { bonds } = usePrimaryMarketBonds();
  const [hoveredCouponId, setHoveredCouponId] = useState<string | null>(null);

  const coupons = useMemo(() => {
    return bonds.flatMap(bond => 
      bond.couponDates.map((date, index) => ({
        id: `${bond.isin}-${index}`,
        date: parseISO(date),
        amount: (bond.bondYield / 2) * (bond.totalInvestmentTarget / 100), // Assuming semi-annual coupons
        token: `bt${bond.companyName.split(' ')[0].toUpperCase()}`,
        isRedeemable: !isFuture(parseISO(date))
      }))
    ).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [bonds]);

  const handleCouponsClick = () => {
    navigate("/coupons");
  };

  const renderCoupon = (coupon: Coupon) => (
    <div
      key={coupon.id}
      className={`grid grid-cols-12 gap-1 sm:gap-2 md:gap-1 lg:gap-2 items-center p-2 sm:p-3 md:p-2 lg:p-3 rounded-md mb-2 ${
        coupon.isRedeemable
          ? "bg-gradient-to-r from-[#1c544e] to-[#1c544e1a] text-[#f2fbf9]"
          : "bg-[#1c544e] bg-opacity-10 border border-[#1c544e] border-opacity-20 text-teal-900 text-opacity-60"
      }`}
    >
      <div className="col-span-3 text-left">
        <p className={`text-[14px] sm:text-[14px] md:text-[14px] lg:text-[11px] mb-0.5 sm:mb-1 md:mb-0.5 lg:mb-1 ${coupon.isRedeemable ? 'opacity-70' : 'opacity-50'}`}>Name</p>
        <span className="text-[16px] sm:text-[16px] md:text-[16px] lg:text-[14px] font-medium font-inter truncate block">{coupon.token}</span>
      </div>
      <div className="col-span-3 text-left">
        <p className={`text-[14px] sm:text-[14px] md:text-[14px] lg:text-[11px] mb-0.5 sm:mb-1 md:mb-0.5 lg:mb-1 ${coupon.isRedeemable ? 'opacity-70' : 'opacity-50'}`}>Date</p>
        <p className="text-[16px] sm:text-[16px] md:text-[16px] lg:text-[14px] font-inter whitespace-nowrap overflow-hidden text-ellipsis" title={format(coupon.date, 'dd MMM yy')}>
          {format(coupon.date, 'dd MMM yy')}
        </p>
      </div>
      <div className="col-span-3 text-left">
        <p className={`text-[14px] sm:text-[14px] md:text-[14px] lg:text-[11px] mb-0.5 sm:mb-1 md:mb-0.5 lg:mb-1 ${coupon.isRedeemable ? 'opacity-70' : 'opacity-50'}`}>Amount</p>
        <p className="text-[16px] sm:text-[16px] md:text-[16px] lg:text-[14px] font-bold font-inter">${coupon.amount.toFixed(2)}</p>
      </div>
      <div className="col-span-3 flex justify-end">
        <button
          className={`w-14 sm:w-18 md:w-14 lg:w-16 h-8 sm:h-10 md:h-12 lg:h-11 bg-[#1c544e] rounded-md flex items-center justify-center ${
            coupon.isRedeemable ? "text-[#f2fbf9] cursor-pointer transition-all duration-300 ease-in-out hover:scale-110" : "text-[#f2fbf9] opacity-40"
          }`}
          disabled={!coupon.isRedeemable}
          title={coupon.isRedeemable ? "Redeem" : "Not redeemable"}
          onMouseEnter={() => setHoveredCouponId(coupon.id)}
          onMouseLeave={() => setHoveredCouponId(null)}
          onClick={() => coupon.isRedeemable && handleCouponsClick()}
        >
          {coupon.isRedeemable ? (
            hoveredCouponId === coupon.id ? (
              <SquareUnlock01Icon className="w-6 sm:w-6 md:w-5 lg:w-6 h-4 sm:h-6 md:h-6 lg:h-6 transition-opacity duration-300 ease-in-out" />
            ) : (
              <SquareLock01Icon className="w-6 sm:w-6 md:w-5 lg:w-6 h-4 sm:h-6 md:h-6 lg:h-6 transition-opacity duration-300 ease-in-out" />
            )
          ) : (
            <SquareLock01Icon className="w-3 sm:w-5 md:w-4 lg:w-5 h-3 sm:h-5 md:h-5 lg:h-5" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <section className="flex flex-col px-2 sm:px-5 md:px-3 lg:px-5 pt-3 sm:pt-5 md:pt-4 lg:pt-5 pb-2 sm:pb-4 md:pb-3 lg:pb-4 font-inter text-[#1c544e] bg-[#F2FBF9] rounded-xl border-teal-900 border-solid border-[0.25px] w-full h-[270px] sm:h-[300px] md:h-[280px] lg:h-[300px]">
      <header className="flex items-center justify-between mb-2 sm:mb-4 md:mb-3 lg:mb-4">
        <div className="flex items-center">
          <CouponPercentIcon className="w-4 sm:w-6 md:w-5 lg:w-6 h-4 sm:h-6 md:h-5 lg:h-6 mr-1 sm:mr-2 md:mr-1.5 lg:mr-2" />
          <h2 className="text-sm sm:text-lg md:text-base lg:text-lg font-bold">Upcoming Coupons</h2>
        </div>
        <LinkSquare01Icon 
          className="w-4 sm:w-6 md:w-5 lg:w-6 h-4 sm:h-6 md:h-5 lg:h-6 cursor-pointer transition-transform duration-200 ease-in-out hover:scale-110" 
          onClick={handleCouponsClick}
          variant="solid"
        />
      </header>
      <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-[#1c544e] scrollbar-track-[#f2fbf9] space-y-2">
        {coupons.map(renderCoupon)}
      </div>
    </section>
  );
};

export default CouponDisbursement;