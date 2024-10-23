import React, { useState } from 'react';
import IdentityVerification from '../components/KYC/IdentityVerification';
import KYCReview from '../components/KYC/KYCReview';
import KYCVerified from '../components/KYC/KYCVerified';
import KYCDisclaimerPopup from '../components/KYC/KYCDisclaimerPopup';

const KYCMenu: React.FC = () => {
  const [stage, setStage] = useState<'disclaimer' | 'identity' | 'review' | 'verified'>('disclaimer');
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  const handleComplete = () => {
    switch (stage) {
      case 'identity':
        setStage('review');
        break;
      case 'review':
        setStage('verified');
        break;
      // 'verified' is the final stage, so we don't need to handle it here
    }
  };

  const handleAcceptDisclaimer = () => {
    setShowDisclaimer(false);
    setStage('identity');
  };

  const handleCloseDisclaimer = () => {
    // Optionally, you can navigate back or show a message here
    console.log("KYC process cancelled");
  };

  return (
    <div className="h-full w-full">
      <KYCDisclaimerPopup
        isOpen={showDisclaimer}
        onClose={handleCloseDisclaimer}
        onAccept={handleAcceptDisclaimer}
      />
      <div className="xs:px-4 xs:py-4 sm:px-0 sm:py-0">
        {stage === 'identity' && <IdentityVerification onComplete={handleComplete} />}
        {stage === 'review' && <KYCReview onComplete={handleComplete} />}
        {stage === 'verified' && <KYCVerified />}
      </div>
    </div>
  );
};

export default KYCMenu;
