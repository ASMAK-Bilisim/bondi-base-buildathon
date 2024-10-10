import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PassportValidIcon } from "@hugeicons/react";
import StepIndicator from '../common/StepIndicator';
import Button from "../common/Button";
import { useKYC } from '../contexts/KYCContext';

const KYCVerified: React.FC = () => {
  const navigate = useNavigate();
  const { setKYCCompleted } = useKYC();

  useEffect(() => {
    setKYCCompleted(true);
  }, [setKYCCompleted]);

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center">
      <StepIndicator steps={3} currentStep={3} />
      <PassportValidIcon
        size={128} 
        color={"#1c544e"}
        variant={"solid"}
        className="mt-10"
      />
      <h1 className="mt-12 text-[20px] font-bold text-[#1c544e] text-center">
        KYC Verification Complete
      </h1>
      <p className="mt-8 text-sm sm:text-base font-medium text-center text-[#1c544e]">
        Your identity has been successfully verified. You now have full access to all features.
      </p>
      <div className="w-full max-w-md mt-14">
        <Button
          label="Go Home"
          intent="primary"
          size="large"
          fullWidth
          onClick={handleGoHome}
        />
      </div>
    </div>
  );
};

export default KYCVerified;