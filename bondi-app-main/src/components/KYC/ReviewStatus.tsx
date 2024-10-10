import React from "react";

const ReviewStatus: React.FC = () => {
  return (
    <div className="flex flex-col items-center mt-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-teal-900 text-center">
        KYC Application Under Review
      </h2>
      <div className="w-24 h-24 mt-8">
        <img src="/assets/loading.gif" alt="Loading" className="w-full h-full" />
      </div>
      <p className="mt-4 text-sm sm:text-base font-medium text-center text-teal-900">
        Your application is currently being reviewed. You will be notified once the process is complete.
      </p>
    </div>
  );
};

export default ReviewStatus;