import React from "react";

const WelcomeSection: React.FC = () => {
  return (
    <section className="py-9 px-9 rounded-xl bg-[#D4E7E2] max-md:px-5 max-md:max-w-full">
      <div className="w-full">
        <h1 className="text-[34px] font-bold leading-none text-teal-900 mb-5">Welcome</h1>
        <p className="text-lg text-teal-900">
          Welcome to your dashboard. Here you can view and manage your account information.
        </p>
      </div>
    </section>
  );
};

export default WelcomeSection;
