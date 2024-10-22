import React from 'react';
import { format } from 'date-fns';
import { Calendar03Icon } from '@hugeicons/react';

interface CouponInfo {
  date: string;
  percentage: number;
}

interface BondCouponScheduleProps {
  tokenName: string;
  coupons: CouponInfo[];
}

const BondCouponSchedule: React.FC<BondCouponScheduleProps> = ({ tokenName, coupons }) => {
  return (
    <div className="bg-[#f2fbf9] rounded-lg shadow-md font-inter relative overflow-hidden mt-6">
      <div className="flex relative z-10">
        <div className="w-64 flex-shrink-0 flex flex-col justify-center items-center pr-4 bg-[#f2fbf9] relative z-20 p-4">
          <h2 className="text-[32px] font-bold text-[#1c544e]">{tokenName}</h2>
        </div>

        <div className="w-[2px] bg-gradient-to-b from-transparent via-[#1c544e] to-transparent opacity-30 relative z-20 self-stretch" />

        <div className="flex-grow overflow-x-auto relative py-8 pl-4">
          <div className="flex space-x-4">
            {coupons.map((coupon, index) => (
              <div key={index} className="flex-shrink-0 w-48 bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center mb-2">
                  <Calendar03Icon className="w-5 h-5 text-[#1c544e] mr-2" />
                  <span className="text-[#1c544e] font-bold">{format(new Date(coupon.date), 'dd MMM yyyy')}</span>
                </div>
                <div className="text-[#1c544e] text-lg font-bold">{coupon.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BondCouponSchedule;
