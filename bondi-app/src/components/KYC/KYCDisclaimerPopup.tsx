import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

interface KYCDisclaimerPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const KYCDisclaimerPopup: React.FC<KYCDisclaimerPopupProps> = ({ isOpen, onClose, onAccept }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCancel = () => {
    onClose();
    navigate('/'); // Navigate to the home page
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-[12px] max-w-2xl max-h-[90vh] overflow-y-auto text-[#1C544E]">
        <h2 className="text-2xl font-bold mb-4">KYC Disclaimer</h2>
        <p className="mb-4">By proceeding with the KYC process you acknowledge that:</p>
        <ol className="list-decimal list-inside mb-4 space-y-2">
          <li>You are not listed on any U.S. Government list of prohibited or restricted parties, including the U.S. Treasury Department's list of Specially Designated Nationals or the U.S. Department of Commerce Denied Persons List or Entity List, the EU consolidated list of persons, groups and entities subject to financial sanctions, the UK Consolidated List of Financial Sanctions Targets;</li>
          <li>You are not located or organized in any U.S. embargoed countries or any country that has been designated by the U.S. Government as "terrorist supporting";</li>
          <li>You are not a citizen, resident, or organized in, the following jurisdictions (the "Restricted Jurisdictions"): Afghanistan, Albania, Belarus, Bulgaria, Bosnia and Herzegovina, Central African Republic, Croatia, Congo, Cuba, Ethiopia, Greece, Hong Kong, Iran, Iraq, Ivory Coast (Cote D'Ivoire), Lebanon, Libya, Mali, Burma (Myanmar), Nicaragua, North Korea, Russia, Serbia, Slovenia, Somalia, Somaliland, South Ossetia, South Sudan, Sudan, Syria, United States, Venezuela, Yemen, Zimbabwe.</li>
        </ol>
        <div className="flex justify-end space-x-4 mt-6">
          <Button
            label="Cancel"
            intent="orange"
            size="medium"
            onClick={handleCancel}
          />
          <Button
            label="I Acknowledge"
            intent="primary"
            size="medium"
            onClick={onAccept}
          />
        </div>
      </div>
    </div>
  );
};

export default KYCDisclaimerPopup;