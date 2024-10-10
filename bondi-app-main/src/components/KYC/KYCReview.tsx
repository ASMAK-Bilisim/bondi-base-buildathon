import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KYCVerified from './KYCVerified';
import StepIndicator from '../common/StepIndicator';
import Button from '../common/Button';

interface KYCReviewProps {
  onComplete: () => void;
}

const KYCReview: React.FC<KYCReviewProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const [showVerified, setShowVerified] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowVerified(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleCancel = () => {
    navigate("/kyc");
  };

  if (showVerified) {
    return <KYCVerified />;
  }

  return (
    <div className="h-full flex flex-col bg-[#D4E7E2] mx-auto px-4 py-8 rounded-tl-[12px]">
      <StepIndicator steps={3} currentStep={2} />
      <div className="flex flex-col items-center mt-14">
        <div className="w-32 h-32">
          <img src="/assets/loading.gif" alt="Loading" className="w-full h-full" />
        </div>
        <h1 className="mt-12 text-[20px] font-bold text-[#1c544e] text-center">
          KYC Application Under Review
        </h1>
        <p className="mt-8 text-sm sm:text-base font-medium text-center text-[#1c544e]">
          Your application is currently being reviewed. You will be notified once the process is complete.
        </p>
        <div className="w-full max-w-md mt-14">
          <Button
            label="Cancel"
            intent="primary"
            size="large"
            fullWidth
            onClick={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default KYCReview;