import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { InformationSquareIcon } from '@hugeicons/react';
import useAnimatedProgress from '../../hooks/useAnimatedProgress';
import CreditScoreDetails from './CreditScoreDetails';
import InvestmentPopup from './InvestmentPopup';
import { useAddress, useContract, useContractRead } from "@thirdweb-dev/react";
import { ethers } from 'ethers';
import { Bond } from '../../hooks/usePrimaryMarketBonds';
import { MOCK_USDC_ADDRESS, contractABI } from '../../constants/contractInfo';
import { useNavigate } from 'react-router-dom';

// Utility function to format numbers correctly
const formatNumber = (value: string | number): string => {
  if (typeof value === 'string') {
    // Remove any non-numeric characters except for the decimal point
    return value.replace(/[^\d.]/g, '');
  }
  return value.toString();
};

interface SmallBondCardProps {
  data: Bond;
}

export const SmallBondCard: React.FC<SmallBondCardProps> = ({ data }) => {
  const {
    companyName,
    companyLogo,
    bondYield,
    maturityDate,
    creditScore,
    currentPrice,
    daysUntilDeadline,
    financialMetrics,
    financialMetricsPeriod,
    companyDescription,
    isin,
    country,
    financialMetricsPdfLink,
    modificationCriteria,
    contractAddress,
    bondTokenAddress,
    ogNftAddress,
    whaleNftAddress,
  } = data;

  const [reachedInvestment, setReachedInvestment] = useState<number>(0);
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const animatedCreditScore = useAnimatedProgress(creditScore, 1500);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInvestmentPopupOpen, setIsInvestmentPopupOpen] = useState(false);

  const address = useAddress();
  const { contract: mockUsdcContract } = useContract(MOCK_USDC_ADDRESS);
  const { contract: fundingContract } = useContract(contractAddress, contractABI);

  const { data: fundingContractBalance, isLoading: isBalanceLoading } = useContractRead(
    mockUsdcContract,
    "balanceOf",
    [contractAddress]
  );

  const { data: targetAmountData, isLoading: isTargetAmountLoading } = useContractRead(
    fundingContract,
    "targetAmount"
  );

  const { data: investedAmountData } = useContractRead(
    fundingContract,
    "investedAmountPerInvestor",
    [address]
  );

  useEffect(() => {
    if (fundingContractBalance && !isBalanceLoading) {
      const balance = ethers.utils.formatUnits(fundingContractBalance.toString().replace(/,/g, ''), 6);
      setReachedInvestment(parseFloat(balance));
    }
  }, [fundingContractBalance, isBalanceLoading]);

  useEffect(() => {
    if (targetAmountData && !isTargetAmountLoading) {
      const target = ethers.utils.formatUnits(targetAmountData.toString().replace(/,/g, ''), 6);
      setTargetAmount(parseFloat(target));
    }
  }, [targetAmountData, isTargetAmountLoading]);

  const investedAmount = investedAmountData 
    ? ethers.utils.formatUnits(investedAmountData.toString().replace(/,/g, ''), 6) 
    : "0";

  const getColorsForCreditScore = (score: number): [string, string, string] => {
    if (score <= 30) return ['#ff7a86', '#e12836', '#a81d27'];
    if (score <= 50) return ['#ffb77d', '#e55f0b', '#a84508'];
    if (score <= 70) return ['#ffeb99', '#fbd932', '#c7ab26'];
    if (score <= 90) return ['#a1ecc5', '#4fc484', '#3a9362'];
    return ['#7da1ff', '#1c54b9', '#143c85'];
  };

  const [startColor, midColor, endColor] = getColorsForCreditScore(animatedCreditScore);

  const investmentProgress = targetAmount > 0 ? (reachedInvestment / targetAmount) * 100 : 0;

  const getProgressBarColor = (progress: number) => {
    return progress < 10 ? '#e55f0b' : '#4fc484';
  };

  const progressBarColor = getProgressBarColor(investmentProgress);
  const trackColor = `${progressBarColor}33`; // 20% opacity

  const markerLineColor = investmentProgress < 10 ? '#f2fbf9' : '#1c544e';

  const statusIcon = investmentProgress <= 10 ? '/assets/OrangeStatus.png' : '/assets/GreenStatus.png';

  // Get today's date in the format "DD MMM YYYY"
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Format number for display, keeping commas and dots
  const formatDisplayNumber = (value: number): string => {
    return value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
  };

  const navigate = useNavigate();

  const handleCheckDetails = () => {
    navigate(`/primary-market/${data.isin}`);
  };

  return (
    <div className="bg-[#f2fbf9] rounded-lg shadow-lg overflow-hidden w-full mb-4">
      <div className="p-4 sm:p-6 pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-4 sm:space-y-0">
          <div className="flex items-center">
            <img src={companyLogo} alt={`${companyName} logo`} className="w-8 h-8 rounded-full mr-2" />
            <h1 className="text-xl font-bold text-[#1c544e]">{companyName}</h1>
          </div>
          <div className="flex space-x-3">
            <Button 
              label="Check Details" 
              intent="secondary" 
              size="small" 
              className="w-36 xs:w-28 lg:w-40 py-0.5 text-[14px] xl:text-[14px] lg:text-[12px] md:text-[12px] sm:text-[12px] xs:text-[11px]"
              onClick={handleCheckDetails}
            />
            <Button 
              label="Invest Now" 
              intent="primary" 
              size="small" 
              className="w-36 xs:w-28 lg:w-40 py-0.5 text-[14px] xl:text-[14px] lg:text-[12px] md:text-[12px] sm:text-[12px] xs:text-[11px]"
              onClick={() => setIsInvestmentPopupOpen(true)}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-auto">
          {/* Column 1 and 2 wrapper */}
          <div className="flex flex-col md:flex-row lg:w-3/5 mb-4 lg:mb-0">
            {/* Column 1: Bond Details */}
            <div className="w-full md:w-2/6 lg:w-1/3 flex flex-row md:flex-col justify-between md:justify-center mb-2 md:mb-0">
              <div className="flex flex-col lg:flex-col items-center lg:items-center justify-center lg:justify-center h-full">
                <h2 className="text-[14px] xl:text-[14px] lg:text-[12px] md:text-[11px] sm:text-[10px] xs:text-[9px] text-[#1c544e] text-center">Current Price</h2>
                <p className="text-[24px] xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] xs:text-[16px] font-bold text-[#1c544e]">${currentPrice}</p>
              </div>
              <div className="flex flex-col lg:flex-col items-center lg:items-center justify-center lg:justify-center h-full md:my-4">
                <h2 className="text-[14px] xl:text-[14px] lg:text-[12px] md:text-[11px] sm:text-[10px] xs:text-[9px] text-[#1c544e] text-center">Yield to Maturity</h2>
                <p className="text-[24px] xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] xs:text-[16px] font-bold text-[#1c544e]">{bondYield}%</p>
              </div>
              <div className="flex flex-col lg:flex-col items-center lg:items-center justify-center lg:justify-center h-full">
                <h2 className="text-[14px] xl:text-[14px] lg:text-[12px] md:text-[11px] sm:text-[10px] xs:text-[9px] text-[#1c544e] text-center">Maturity Date</h2>
                <p className="text-[24px] xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] xs:text-[16px] font-bold text-[#1c544e]">{maturityDate}</p>
              </div>
            </div>

            {/* Divider 1 */}
            <div className="hidden md:block w-[1px] bg-gradient-to-b from-transparent via-[#1c544e] to-transparent opacity-40 mx-2 my-2"></div>

            {/* Column 2: Company Description and Investment Progress */}
            <div className="w-full md:w-4/6 lg:w-2/3 space-y-2 px-0 md:px-6 flex flex-col mb-4 md:mb-0">
              <div className="flex-grow overflow-hidden">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-[14px] xl:text-[14px] lg:text-[13px] md:text-[13px] sm:text-[14px] xs:text-[12px] font-semibold text-[#1c544e]">Company Description</h2>
                  <div className="flex items-center">
                    <span className="text-[14px] xl:text-[14px] lg:text-[13px] md:text-[13px] sm:text-[14px] xs:text-[12px] font-semibold text-[#1c544e] mr-2">Payment Pending Phase</span>
                    <img 
                      src={statusIcon} 
                      alt="Status" 
                      className="w-6 h-6 animate-pulse"
                    />
                  </div>
                </div>
                <div className="h-[140px] overflow-y-auto pr-2">
                  <p className="text-[14px] xl:text-[13px] lg:text-[11px] md:text-[13px] sm:text-[14px] xs:text-[13px] text-[#1c544e] opacity-80 text-justify">{companyDescription}</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-left">
                    <h3 className="text-[16px] xl:text-[14px] lg:text-[13px] md:text-[13px] sm:text-[14px] xs:text-[13px] font-bold text-[#1c544e]">Reached Investment (USDC)</h3>
                    <span className="text-[18px] xl:text-[18px] lg:text-[16px] md:text-[15px] sm:text-[14px] xs:text-[15px] text-[#1c544e] font-bold">
                      {`$${formatDisplayNumber(reachedInvestment)}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <h3 className="text-[16px] xl:text-[14px] lg:text-[13px] md:text-[13px] sm:text-[14px] xs:text-[13px] font-bold text-[#1c544e]">Target Investment</h3>
                    <span className="text-[18px] xl:text-[18px] lg:text-[16px] md:text-[15px] sm:text-[14px] xs:text-[15px] text-[#1c544e] font-bold">
                      {`$${formatDisplayNumber(targetAmount)}`}
                    </span>
                  </div>
                </div>
                <div className="relative rounded-full h-4 overflow-hidden" style={{ backgroundColor: trackColor }}>
                  {/* 10% marker line */}
                  <div 
                    className="absolute top-0 left-[10%] w-0.5 h-full z-20"
                    style={{ backgroundColor: markerLineColor }}
                  ></div>
                  
                  {/* Progress bar */}
                  <div 
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-300 ease-linear flex items-center justify-end pr-1 z-10"
                    style={{ 
                      width: `${investmentProgress}%`,
                      backgroundColor: progressBarColor,
                    }}
                  >
                    <span className="text-[10px] font-bold text-[#f2fbf9]">
                      {Math.round(investmentProgress)}%
                    </span>
                  </div>
                </div>
                <p className="text-right text-[10px] xl:text-[10px] lg:text-[9px] md:text-[8px] sm:text-[7px] xs:text-[6px] text-[#1c544e] mt-1 opacity-70">
                  {daysUntilDeadline === null 
                    ? 'Calculating days...' 
                    : `${daysUntilDeadline} Days Until Deadline`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Divider 2 */}
          <div className="hidden lg:block w-[1px] bg-gradient-to-b from-transparent via-[#1c544e] to-transparent opacity-40 mx-2 my-2"></div>

          {/* Column 3: Credit Score */}
          <div className="w-full lg:w-2/5 pl-0 lg:pl-6 flex flex-col items-center lg:items-start justify-center mt-4 lg:mt-0">
            <div 
              className="bg-[#071f1e] text-[#f2fbf9] p-4 px-5 rounded-lg flex flex-col md:justify-center md:flex-row h-auto md:h-[200px] relative w-full sm:w-[90%] md:w-[600px] lg:w-full lg:mx-0 lg:ml-auto"
            >
              <div className="flex flex-col justify-between flex-grow pr-4 mb-4 md:mb-0 md:w-1/2">
                <div>
                  <h2 className="text-14px xl:text-14px lg:text-12px md:text-12px sm:text-10px xs:text-9px font-semibold mb-2 whitespace-nowrap overflow-hidden text-ellipsis">Credit Score Overview</h2>
                  <div className="space-y-1 mt-2">
                    <p className="text-[12px] xl:text-[12px] lg:text-[12px] md:text-[13px] sm:text-[12px] xs:text-[11px] text-[#f2fbf9] opacity-80">
                      Debt Features: <span className="font-extrabold">{data.modificationCriteria.DebtFeatures}</span>
                    </p>
                    <p className="text-[12px] xl:text-[12px] lg:text-[12px] md:text-[13px] sm:text-[12px] xs:text-[11px] text-[#f2fbf9] opacity-80">
                      ISIN: <span className="font-extrabold">{data.isin}</span>
                    </p>
                  </div>
                </div>
                <Button 
                  label="See Detailed Score"
                  intent="darkOutline" 
                  size="small" 
                  className="w-full lg:w-auto py-0.5 text-[12px] xl:text-[12px] lg:text-[11px] md:text-[11px] sm:text-[10px] xs:text-[8px] mt-2 flex items-center justify-center whitespace-nowrap max-w-[160px]"
                  onClick={() => setIsModalOpen(true)}
                >
                  <InformationSquareIcon 
                    className="xl:w-4 xl:h-4 lg:w-4 lg:h-4 md:w-4 md:h-4 sm:w-4 sm:h-4 xs:w-3 xs:h-3"
                    variant="stroke"
                    color="#f2fbf9"
                  />
                  <span className="ml-2">See Detailed Score</span>
                </Button>
              </div>
              <div className="flex items-center justify-center md:justify-end w-full md:w-1/2">
                <div className="w-40 h-40 xl:w-40 xl:h-40 lg:w-36 lg:h-36 md:w-40 md:h-40 sm:w-40 sm:h-40 xs:w-36 xs:h-36 relative">
                  <CircularProgressbar
                    value={animatedCreditScore}
                    text={`${Math.round(animatedCreditScore)}`}
                    counterClockwise={true}
                    styles={buildStyles({
                      textColor: midColor,
                      textSize: '36px',
                      pathColor: `url(#creditScoreGradient-${Math.round(animatedCreditScore)})`,
                      trailColor: "rgba(255,255,255,0.2)",
                      pathTransition: 'none',
                    })}
                  />
                  <svg style={{ height: 0 }}>
                    <defs>
                      <linearGradient id={`creditScoreGradient-${Math.round(animatedCreditScore)}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={startColor} />
                        <stop offset="50%" stopColor={midColor} />
                        <stop offset="100%" stopColor={endColor} />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute bottom-7 left-0 right-0 text-center">
                    <p className="text-[10px] xl:text-[10px] lg:text-[9px] md:text-[9px] sm:text-[7px] xs:text-[6px] leading-tight text-[#f2fbf9] opacity-50">Updated:</p>
                    <p className="text-[10px] xl:text-[10px] lg:text-[9px] md:text-[9px] sm:text-[7px] xs:text-[6px] leading-tight text-[#f2fbf9] opacity-50">{today}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <CreditScoreDetails 
          onClose={() => setIsModalOpen(false)} 
          creditScore={creditScore}
          companyName={companyName}
          companyDescription={companyDescription}
          companyLogo={companyLogo}
          lastUpdated={today}
          financialMetricsPdfLink={financialMetricsPdfLink}
          financialMetrics={financialMetrics}
          financialMetricsPeriod={financialMetricsPeriod}
          isin={isin}
          country={country}
          modificationCriteria={modificationCriteria}
        />
      )}
      
      {isInvestmentPopupOpen && (
        <InvestmentPopup
          onClose={() => setIsInvestmentPopupOpen(false)}
          bondData={{
            companyName,
            companyLogo,
            bondYield,
            maturityDate,
            currentPrice,
            isin,
            contractAddress,
            bondTokenAddress,
            ogNftAddress,
            whaleNftAddress,
          }}
        />
      )}
    </div>
  );
};