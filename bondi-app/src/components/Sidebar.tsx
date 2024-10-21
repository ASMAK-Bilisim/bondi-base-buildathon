import React from "react";
import { useLocation, Link } from "react-router-dom";
import MenuItem from "./MenuItem";
import {
  Store01Icon,
  CouponPercentIcon,
  ScrollIcon,
  MarketAnalysisIcon
} from '@hugeicons/react';
import { useKYC } from './contexts/KYCContext'; // Import the useKYC hook

const menuItems = [
  { icon: Store01Icon, label: "Primary Market", path: "/" }, // Updated path to "/"
  { icon: MarketAnalysisIcon, label: "CDS Market", path: "/cds-market" },
];

const otherItems = [
  { icon: ScrollIcon, label: "Docs", path: "https://docs.bondifinance.io", external: true },
];

interface SidebarProps {
  isCompact: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCompact }) => {
  const location = useLocation();
  const { isKYCCompleted } = useKYC(); // Use the KYC context

  // Add Coupons menu item only if KYC is completed
  const fullMenuItems = isKYCCompleted
    ? [...menuItems, { icon: CouponPercentIcon, label: "Coupons", path: "/coupons" }]
    : menuItems;

  return (
    <aside 
      className={`flex-shrink-0 h-screen overflow-y-auto bg-[#f2fbf9] transition-all duration-300 ease-in-out ${
        isCompact ? 'w-16' : 'w-54'
      }`}
    >
      <div className="flex flex-col h-full text-sm font-semibold text-teal-900 pt-7">
        <div className={`flex justify-center mb-3 transition-opacity duration-300 ${isCompact ? 'opacity-0' : 'opacity-100'}`}>
          <img
            src="/assets/Turtle.png" 
            alt="Bondi Finance Logo"
            className="object-contain w-[103px] aspect-[1.98]"
          />
        </div>
        <nav className={`flex flex-col h-full ${isCompact ? 'px-0.5' : 'px-3'} pt-4 pb-3 mt-7 rounded-xl ${isCompact ? 'mx-1' : 'mx-2'}`}>
          <div className="flex flex-col w-full">
            <h2 className={`text-[18px] font-extrabold leading-none mb-4 transition-all duration-300 ${isCompact ? 'text-center text-xs' : ''}`}>
              Menu
            </h2>
            <div className="flex flex-col">
              {fullMenuItems.map((item, index) => (
                <Link key={item.path} to={item.path} className={`block transition-all duration-300 ${index > 0 ? 'mt-[7%]' : ''}`}>
                  <MenuItem
                    icon={item.icon}
                    label={item.label}
                    active={location.pathname === item.path || (item.path === "/" && location.pathname === "/")} // Updated active check
                    isCompact={isCompact}
                  />
                </Link>
              ))}
            </div>
          </div>
          <div className="flex-grow min-h-[7px] transition-all duration-300"></div>
          <div className="flex flex-col w-full whitespace-nowrap">
            <h2 className={`text-[18px] font-extrabold leading-none mb-4 transition-all duration-300 ${isCompact ? 'text-center text-xs' : ''}`}>
              Other
            </h2>
            <div className="flex flex-col">
              {otherItems.map((item, index) => (
                <div key={item.path} className={`block transition-all duration-300 ${index > 0 ? 'mt-[7%]' : ''}`}>
                  {item.external ? (
                    <a href={item.path} target="_blank" rel="noopener noreferrer">
                      <MenuItem
                        icon={item.icon}
                        label={item.label}
                        active={false}
                        isCompact={isCompact}
                      />
                    </a>
                  ) : (
                    <Link to={item.path}>
                      <MenuItem
                        icon={item.icon}
                        label={item.label}
                        active={location.pathname === item.path}
                        isCompact={isCompact}
                      />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
