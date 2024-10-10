import React from "react";

interface MenuItemProps {
  icon: React.FC<{ size: number; color: string; variant: "solid" }>;
  label: string;
  active: boolean;
  isCompact: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon: Icon, label, active, isCompact }) => {
  return (
    <div
      className={`flex items-center ${isCompact ? 'justify-center' : 'px-3'} py-2 rounded-lg transition-colors duration-200 ${
        active ? "bg-[#1C544E] text-white" : "hover:bg-[#D4E7E2] text-[#1C544E]"
      }`}
    >
      <div className={`flex items-center justify-center ${isCompact ? 'w-full' : 'w-6 mr-2'}`}>
        <Icon size={24} color={active ? "#ffffff" : "#1C544E"} variant="solid" />
      </div>
      {!isCompact && <span className="flex-grow">{label}</span>}
    </div>
  );
};

export default MenuItem;
