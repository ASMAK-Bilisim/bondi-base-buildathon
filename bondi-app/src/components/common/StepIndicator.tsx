import React from 'react';

interface StepIndicatorProps {
  steps: number;
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="relative w-full max-w-md mx-auto my-4 xs:my-0">
      <div className="h-1 bg-[#679b96] rounded-full">
        <div
          className="h-full bg-[#1c544e] rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${((currentStep - 1) / (steps - 1)) * 100}%` }}
        ></div>
      </div>
      <div className="absolute top-1/2 left-0 right-0 flex justify-between -mt-2">
        {Array.from({ length: steps }, (_, index) => (
          <div
            key={index}
            className={`rounded-full border-2 transition-all duration-300 ease-in-out
              ${index < currentStep ? 'bg-[#1c544e] border-[#1c544e]' : 'bg-[#679b96] border-[#679b96]'}
              ${index === currentStep - 1 ? 'w-5 h-5 -mt-0.5' : 'w-4 h-4'}`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;