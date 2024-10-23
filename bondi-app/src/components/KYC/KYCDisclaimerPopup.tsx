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
      <div className="bg-white p-4 sm:p-8 rounded-none sm:rounded-[12px] w-full h-full sm:w-auto sm:h-auto sm:max-w-2xl sm:max-h-[90vh] overflow-y-auto text-[#1C544E] flex flex-col">
        <h2 className="text-lg xs:text-[18px] font-bold mb-4">KYC Disclaimer</h2>
        <p className="text-xs xs:text-[16px] mb-3 sm:mb-4">By proceeding with the KYC process you acknowledge that:</p>
        <ol className="list-decimal list-outside ml-5 mb-4 space-y-2 text-xs xs:text-[14px] xs:mt-4 flex-grow">
          <li className="mb-2">You are not listed on any U.S. Government list of prohibited or restricted parties, including the U.S. Treasury Department's list of Specially Designated Nationals or the U.S. Department of Commerce Denied Persons List or Entity List, the EU consolidated list of persons, groups and entities subject to financial sanctions, the UK Consolidated List of Financial Sanctions Targets;</li>
          
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#1c544e] to-transparent opacity-40"></div>
          
          <li className="mb-2">You are not located or organized in any U.S. embargoed countries or any country that has been designated by the U.S. Government as "terrorist supporting";</li>
          
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#1c544e] to-transparent opacity-40 my-2 sm:my-3"></div>
          
          <li>You are not a citizen, resident, or organized in, the following jurisdictions (the "Restricted Jurisdictions"): Afghanistan, Albania, Belarus, Bulgaria, Bosnia and Herzegovina, Central African Republic, Croatia, Congo, Cuba, Ethiopia, Greece, Hong Kong, Iran, Iraq, Ivory Coast (Cote D'Ivoire), Lebanon, Libya, Mali, Burma (Myanmar), Nicaragua, North Korea, Russia, Serbia, Slovenia, Somalia, Somaliland, South Ossetia, South Sudan, Sudan, Syria, United States, Venezuela, Yemen, Zimbabwe.</li>
        </ol>
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-6">
          <Button
            label="Cancel"
            intent="orange"
            size="medium"
            onClick={handleCancel}
            className="w-full sm:w-auto text-sm sm:text-base"
          />
          <Button
            label="I Acknowledge"
            intent="primary"
            size="medium"
            onClick={onAccept}
            className="w-full sm:w-auto text-sm sm:text-base"
          />
        </div>
      </div>
    </div>
  );
};

export default KYCDisclaimerPopup;
