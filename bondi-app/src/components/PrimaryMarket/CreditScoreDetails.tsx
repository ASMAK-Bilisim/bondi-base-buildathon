import React from 'react';
import { BankIcon, BarCode02Icon, GlobeIcon, ChartHistogramIcon, CancelSquareIcon, Sorting05Icon, ArrowUpRight03Icon } from "@hugeicons/react";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface CreditScoreDetailsProps {
  onClose: () => void;
  creditScore: number;
  companyName: string;
  companyDescription: string;
  companyLogo: string;
  lastUpdated: string;
  financialMetricsPdfLink: string;
  financialMetrics: {
    WorkingCapital: string;
    TotalDebt: string;
    TotalAssets: string;
    TotalLiabilities: string;
    RetainedEarnings: string;
    OperatingIncome: string;
    BookValue: string;
  };
  financialMetricsPeriod: string; // New prop for the financial metrics period
  isin: string;
  country: string;
  modificationCriteria: {
    CurrencyDevaluationRisk: string;
    IndustryRisk: string;
    CompetitivePosition: string;
    DebtFeatures: string;
    ComparativeSpread: string;
  };
}

const CreditRatingDetails: React.FC<CreditScoreDetailsProps> = ({ 
  onClose, 
  creditScore, 
  companyName, 
  companyDescription, 
  companyLogo, 
  lastUpdated,
  financialMetricsPdfLink,
  financialMetrics,
  financialMetricsPeriod, // New prop
  isin,
  country,
  modificationCriteria
}) => {
  const getColorsForCreditScore = (score: number): [string, string, string] => {
    if (score <= 30) return ['#ff7a86', '#e12836', '#a81d27'];
    if (score <= 50) return ['#ffb77d', '#e55f0b', '#a84508'];
    if (score <= 70) return ['#ffeb99', '#fbd932', '#c7ab26'];
    if (score <= 90) return ['#a1ecc5', '#4fc484', '#3a9362'];
    return ['#7da1ff', '#1c54b9', '#143c85'];
  };

  const [startColor, midColor, endColor] = getColorsForCreditScore(creditScore);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-[#F2FBF9] rounded-[20px] p-6 max-w-4xl w-full h-[95vh] relative flex flex-col overflow-hidden"> {/* Changed h-[90vh] to h-[95vh] */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#1C544E] hover:text-[#3EBAAD] transition-colors"
        >
          <CancelSquareIcon 
            size={34}
            variant="solid"
            className="transition-colors duration-200"
            color="currentColor"
          />
        </button>
        <h1 className="text-[#1C544E] text-[24px] font-semibold mb-4">Credit Rating Details</h1>
        
        <div className="flex flex-col lg:flex-row gap-4 flex-grow overflow-auto"> {/* Added overflow-auto */}
          {/* Left Panel */}
          <div className="flex-1 bg-[#F2FBF9] rounded-xl border border-[#1C544E] p-4 lg:w-[58%]">
            <div className="flex items-center mb-3">
              <img src={companyLogo} alt={`${companyName} logo`} className="w-8 h-8 rounded-full mr-3" />
              <div>
                <h2 className="text-[#1C544E] text-lg font-bold">{companyName}</h2>
              </div>
            </div>
            
            <div className="min-h-[5em] mb-6 mt-6"> {/* Added min-height */}
              <p className="text-[#1C544E] text-[14px]">
                {companyDescription}
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center mb-1">
                  <BankIcon
                    color={"#1C544E"}
                    variant={"stroke"}
                    className="mr-1"
                  />
                  <span className="text-[#1C544E] font-medium">Issuer</span>
                </div>
                <div className="text-[#1C544E] font-bold text-center text-[12px]">{companyName.toUpperCase()}</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center mb-1">
                  <BarCode02Icon
                    color={"#1C544E"}
                    variant={"solid"}
                    className="mr-1"
                  />
                  <span className="text-[#1C544E] font-medium">ISIN</span>
                </div>
                <div className="text-[#1C544E] font-bold text-center text-[12px]">{isin}</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center mb-1">
                  <GlobeIcon
                    color={"#1C544E"}
                    variant={"stroke"}
                    className="mr-1"
                  />
                  <span className="text-[#1C544E] font-medium">Country</span>
                </div>
                <div className="text-[#1C544E] font-bold text-center text-[12px]">{country}</div>
              </div>
            </div>
            
            <div className="border-t border-[#1C544E] pt-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <ChartHistogramIcon
                    color={"#1C544E"}
                    variant={"stroke"}
                    className="mr-1 mt-1 mb-1"
                  />
                  <h3 className="text-[#1C544E] text-[16px] font-bold">Financial Metrics</h3>
                </div>
                <a 
                  href={financialMetricsPdfLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center bg-transparent text-[#1C544E] hover:bg-[#1C544E] hover:text-[#F2FBF9] transition-colors duration-200 rounded-md px-3 py-1 border border-[#1C544E] border-opacity-50 group"
                >
                  <span className="mr-2 text-[12px]">View the Document</span>
                  <ArrowUpRight03Icon
                    size={16}
                    color={"currentColor"}
                    variant="stroke"
                    className="group-hover:text-[#F2FBF9]"
                  />
                </a>
              </div>
              <div className="flex justify-between items-end mb-4">
                <p className="text-[#1C544E] text-[11px] opacity-90 flex-grow">
                  These are the key metrics used to reach the EMS score, Taken from the firm's latest available balance sheet.
                </p>
                <p className="text-[#1C544E] text-[11px] italic font-medium ml-2 whitespace-nowrap">
                  As of: {financialMetricsPeriod}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[13px] font-medium">
                {financialMetrics && Object.entries(financialMetrics).map(([label, value], index, array) => (
                  <React.Fragment key={label}>
                    <div className="text-[#1C544E]">{label.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div className="text-[#1C544E] font-bold text-right text-[15px]">{value}</div>
                    {index < array.length - 1 && (
                      <div className="col-span-2 h-[0.5px] bg-[#1C544E] opacity-30 my-1"></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Panel */}
          <div className="w-full lg:w-[42%] bg-[#071F1E] rounded-xl p-4 text-[#F2FBF9]">
            <div className="flex items-center mb-3">
              <Sorting05Icon 
              color={"#f2fbf9"}
              variant={"stroke"}
              />
              <h3 className="text-sm font-medium">Bond Spectrum Breakdown</h3>
            </div>
            
            <div className="flex mb-3">
              <div className="w-[180px] h-[180px] rounded-full relative mr-4 flex-shrink-0">
                <CircularProgressbar
                  value={creditScore}
                  text={`${Math.round(creditScore)}`}
                  counterClockwise={true}
                  styles={buildStyles({
                    textColor: midColor,
                    textSize: '36px',
                    pathColor: `url(#creditScoreGradient-${Math.round(creditScore)})`,
                    trailColor: "rgba(255,255,255,0.2)",
                  })}
                />
                <div className="absolute bottom-7 left-0 right-0 text-center">
                  <p className="text-[10px] xl:text-[10px] lg:text-[9px] md:text-[9px] sm:text-[7px] xs:text-[6px] leading-tight text-[#f2fbf9] opacity-50">Updated:</p>
                  <p className="text-[10px] xl:text-[10px] lg:text-[9px] md:text-[9px] sm:text-[7px] xs:text-[6px] leading-tight text-[#f2fbf9] opacity-50">{lastUpdated}</p>
                </div>
                <svg style={{ height: 0 }}>
                  <defs>
                    <linearGradient id={`creditScoreGradient-${Math.round(creditScore)}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={startColor} />
                      <stop offset="50%" stopColor={midColor} />
                      <stop offset="100%" stopColor={endColor} />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              
              <div className="flex flex-col justify-center w-full mt-6"> {/* Changed from justify-between to justify-center */}
                {['81-100', '61-80', '41-60', '21-40', '0-20'].map((range, index) => (
                  <div key={range} className="flex items-center mb-5"> {/* Changed mb-7 to mb-2 */}
                    <div className="w-full relative">
                      <div className={`h-1 w-full rounded-full ${[
                        'bg-gradient-to-r from-[#4280F0] to-[#26498A]',
                        'bg-gradient-to-r from-[#4FC484] to-[#265E3F]',
                        'bg-gradient-to-r from-[#FBD932] to-[#95811E]',
                        'bg-gradient-to-r from-[#FF7D2C] to-[#994B1A]',
                        'bg-gradient-to-r from-[#E12836] to-[#7B161E]',
                      ][index]}`}></div>
                      <span className="absolute top-[-14px] left-0 text-[8px] font-extrabold text-[#F2FBF9] opacity-60">
                        {range}
                      </span>
                      <span className="absolute top-[-14px] right-0 text-[8px] font-medium text-[#F2FBF9] opacity-60 whitespace-nowrap">
                        {['Very Low Risk', 'Low Risk', 'Average Risk', 'Moderate Risk', 'High Risk'][index]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <h4 className="text-[15px] font-bold mt-6 mb-4">Modification Criteria</h4>

            <div className="grid grid-cols-[60%_40%] gap-x-2 gap-y-1.5 mb-3 text-[14px]">
              {modificationCriteria && Object.entries(modificationCriteria).map(([label, value], index, array) => (
                <React.Fragment key={label}>
                  <div className="truncate">{label.replace(/([A-Z])/g, ' $1').trim()}</div>
                  <div className="font-bold text-right">{value}</div>
                  {index < array.length - 1 && (
                    <div className="col-span-2 h-[0.5px] bg-[#F2FBF9] opacity-30 my-1"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
            
            <h4 className="text-[15px] font-bold mb-2 mt-8">Final Rating</h4>
            
            <div className="grid grid-cols-2 gap-1 text-[14px]">
              {[
                ["Normalized EMS", "70"],
                ["Total Adjusted Score", "75"],
              ].map(([label, value], index, array) => (
                <React.Fragment key={label}>
                  <div>{label}</div>
                  <div className="font-bold text-right text-[14px]">{value}</div>
                  {index < array.length - 1 && (
                    <div className="col-span-2 h-[0.5px] bg-[#F2FBF9] opacity-30 my-1"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditRatingDetails;