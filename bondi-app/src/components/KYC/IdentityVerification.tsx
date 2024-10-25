import React, { useState } from "react";
import StepIndicator from "../common/StepIndicator";
import CountrySelect from "./CountrySelect";
import DocumentTypeSelect from "./DocumentTypeSelect";
import UploadField from "./UploadField";
import Button from "../common/Button";

interface IdentityVerificationProps {
  onComplete: () => void;
}

const IdentityVerification: React.FC<IdentityVerificationProps> = ({ onComplete }) => {
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [isChecked, setIsChecked] = useState<boolean>(false);

  const isFormValid = () => {
    // Remove the file upload requirements
    return selectedCountry && selectedDocumentType && isChecked;
  };

  const handleContinue = () => {
    if (isFormValid()) {
      onComplete(); // Call the onComplete prop instead of navigating
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-[#D4E7E2] rounded-tl-[12px] xs:pb-10 overflow-y-auto">
      <main className="w-full max-w-[678px] px-4 xs:px-2 py-8 sm:px-6 lg:px-8">
        <section className="flex flex-col items-center">
          <StepIndicator steps={3} currentStep={1} />
          <h1 className="mt-8 text-2xl sm:text-[24px] xs:text-[18px] font-bold text-teal-900 text-center">
            Identity Verification
          </h1>
          <p className="mt-4 text-sm sm:text-[16px] xs:text-[12px] font-medium text-center text-teal-900">
            Please select your country and document type. Document upload is optional for this test app.
          </p>
          <form className="w-full sm:mt-8 xs:mt-4">
            <div className="flex flex-col sm:flex-row sm:w-full sm:gap-6 xs:gap-2">
              <CountrySelect onSelect={setSelectedCountry} />
              <DocumentTypeSelect onSelect={setSelectedDocumentType} />
            </div>
            <div className="sm:mt-8 xs:mt-4">
              <div className={`flex flex-col sm:flex-row sm:gap-6 xs:gap-2 ${selectedDocumentType === "Passport" ? "justify-center" : ""}`}>
                <UploadField 
                  label={selectedDocumentType === "Passport" ? "Passport photo page (optional)" : "Front of your ID (optional)"} 
                  className={selectedDocumentType === "Passport" ? "w-full sm:w-1/2" : ""}
                  onFileSelect={setFrontFile}
                />
                {selectedDocumentType !== "Passport" && (
                  <UploadField 
                    label="Back of your ID (optional)" 
                    onFileSelect={setBackFile}
                  />
                )}
              </div>
            </div>
            <label className="flex items-center sm:mt-8 xs:mt-4 sm:text-[14px] xs:text-[12px] font-medium text-teal-900">
              <input 
                type="checkbox" 
                className="mr-2" 
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
              />
              I confirm that the information provided is accurate and complete. 
              (You're not required to upload documents for this test app)
            </label>
            <div className="sm:mt-8 xs:mt-4">
              <Button
                label="Continue"
                intent="primary"
                fullWidth
                className={`${!isFormValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleContinue}
                disabled={!isFormValid()}
              />
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default IdentityVerification;
