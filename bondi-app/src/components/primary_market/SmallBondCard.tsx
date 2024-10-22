import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { InformationSquareIcon } from '@hugeicons/react';
import useAnimatedProgress from '../../hooks/useAnimatedProgress';
import CreditScoreDetails from './CreditScoreDetails';
import InvestmentPopup from './InvestmentPopup';
import MintNowPopup from './MintNowPopup';
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb";
import { Bond } from '../../hooks/usePrimaryMarketBonds';
import { MOCK_USDC_ADDRESS, contractABI, mockUsdcABI, bondDistributionABI } from '../../constants/contractInfo';
import { useNavigate } from 'react-router-dom';
import { useKYC } from '../contexts/KYCContext';
import { client } from '../../client';
import { baseSepolia } from 'thirdweb/chains';

interface SmallBondCardProps {
  data: Bond;
}

enum BondState {
  PaymentPending,
  Purchase,
  Minting
}

// Add this function at the top of the file, outside the component
const calculateYTM = (couponRate: number, faceValue: number, price: number, yearsToMaturity: number): number => {
  const periodsPerYear = 2; // Semi-annual coupon payments
  const totalPeriods = yearsToMaturity * periodsPerYear;
  const couponPerPeriod = (couponRate / 100) * faceValue / periodsPerYear;

  // Newton-Raphson method to approximate YTM
  let ytm = couponRate / 100; // Initial guess
  const tolerance = 0.0001;
  let difference = 1;

  while (Math.abs(difference) > tolerance) {
    const ytmPerPeriod = ytm / periodsPerYear;
    let bondPrice = 0;
    for (let i = 1; i <= totalPeriods; i++) {
      bondPrice += couponPerPeriod / Math.pow(1 + ytmPerPeriod, i);
    }
    bondPrice += faceValue / Math.pow(1 + ytmPerPeriod, totalPeriods);

    difference = bondPrice - price;
    
    // Calculate the derivative of the bond price function
    let derivativeBondPrice = 0;
    for (let i = 1; i <= totalPeriods; i++) {
      derivativeBondPrice -= i * couponPerPeriod / Math.pow(1 + ytmPerPeriod, i + 1);
    }
    derivativeBondPrice -= totalPeriods * faceValue / Math.pow(1 + ytmPerPeriod, totalPeriods + 1);
    derivativeBondPrice /= periodsPerYear;

    // Update YTM
    ytm -= difference / derivativeBondPrice;
  }

  return ytm * 100; // Convert to percentage
};

const PhaseTooltip: React.FC<{ description: string }> = ({ description }) => (
  <div className="absolute right-0 top-full mt-1 p-2 bg-white border border-app-primary-2 rounded-lg shadow-lg z-10 w-48">
    <p className="text-[11px] text-[#071f1e]">{description}</p>
  </div>
);

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
  const [investedAmount, setInvestedAmount] = useState<string>('0.00');
  const animatedCreditScore = useAnimatedProgress(creditScore, 1500);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInvestmentPopupOpen, setIsInvestmentPopupOpen] = useState(false);
  const [isTargetReached, setIsTargetReached] = useState(false);
  const [isMintPopupOpen, setIsMintPopupOpen] = useState(false);
  const [bondState, setBondState] = useState<BondState>(BondState.PaymentPending);
  const [realizedPrice, setRealizedPrice] = useState<string>('0.00');
  const [currentYTM, setCurrentYTM] = useState<number>(data.bondYield);
  const [hasInvested, setHasInvested] = useState(false);
  const [showPhaseInfo, setShowPhaseInfo] = useState(false);
  const [hasMinted, setHasMinted] = useState(false);

  const account = useActiveAccount();
  const { isKYCCompleted } = useKYC();
  const navigate = useNavigate();

  const mockUsdcContract = getContract({
    client,
    address: MOCK_USDC_ADDRESS,
    abi: mockUsdcABI, 
    chain: baseSepolia,
  });

  const fundingContract = getContract({
    client,
    address: contractAddress,
    abi: contractABI,
    chain: baseSepolia,
  });

  const bondDistributionContract = getContract({
    client,
    address: bondTokenAddress,
    abi: bondDistributionABI,
    chain: baseSepolia,
  });

  const { data: fundingContractBalance, isLoading: isBalanceLoading } = useReadContract({
    contract: mockUsdcContract,
    method: "balanceOf",
    params: [contractAddress],
  });

  const { data: targetAmountData, isLoading: isTargetAmountLoading } = useReadContract({
    contract: fundingContract,
    method: "targetAmount",
  });

  const { data: investedAmountData, isLoading: isInvestedAmountLoading } = useReadContract({
    contract: fundingContract,
    method: "investedAmountPerInvestor",
    params: [account?.address || '0x'],
  });

  const { data: bondPriceData, isLoading: isBondPriceLoading } = useReadContract({
    contract: bondDistributionContract,
    method: "bondPrice",
  });

  const { data: bondPriceSetData, isLoading: isBondPriceSetLoading } = useReadContract({
    contract: bondDistributionContract,
    method: "bondPriceSet",
  });

  const { data: claimableTokensData, isLoading: isClaimableTokensLoading } = useReadContract({
    contract: bondDistributionContract,
    method: "getClaimableTokens",
    params: [account?.address || '0x'],
  });

  useEffect(() => {
    if (fundingContractBalance && !isBalanceLoading && targetAmountData && !isTargetAmountLoading) {
      const balance = typeof fundingContractBalance === 'bigint' 
        ? Number(fundingContractBalance)
        : Number(fundingContractBalance.toString());
      setReachedInvestment(balance / 1e6);

      const target = typeof targetAmountData === 'bigint'
        ? Number(targetAmountData)
        : Number(targetAmountData.toString());
      setTargetAmount(target / 1e6);

      if (balance >= target) {
        if (bondPriceSetData) {
          setBondState(BondState.Minting);
        } else {
          setBondState(BondState.Purchase);
        }
      } else {
        setBondState(BondState.PaymentPending);
      }
    }
  }, [fundingContractBalance, isBalanceLoading, targetAmountData, isTargetAmountLoading, bondPriceSetData]);

  useEffect(() => {
    if (bondState === BondState.Minting && bondPriceData && !isBondPriceLoading) {
      const price = typeof bondPriceData === 'bigint' 
        ? Number(bondPriceData) / 1e6 // Assuming 6 decimal places for USDC
        : Number(bondPriceData.toString()) / 1e6;
      setRealizedPrice(price.toFixed(2));
      
      // Calculate YTM based on the realized price
      const maturityDate = new Date(data.maturityDate);
      const now = new Date();
      const yearsToMaturity = (maturityDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365);
      const calculatedYTM = calculateYTM(data.couponPercentage, 100, price, yearsToMaturity);
      setCurrentYTM(calculatedYTM);
    } else {
      // Calculate YTM based on the current price for PaymentPending and Purchase phases
      const yearsToMaturity = (new Date(data.maturityDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 365);
      const calculatedYTM = calculateYTM(data.couponPercentage, 100, data.currentPrice, yearsToMaturity);
      setCurrentYTM(calculatedYTM);
    }
  }, [bondState, bondPriceData, isBondPriceLoading, data.currentPrice, data.maturityDate, data.couponPercentage]);

  useEffect(() => {
    if (reachedInvestment >= targetAmount && targetAmount > 0) {
      setIsTargetReached(true);
    } else {
      setIsTargetReached(false);
    }
  }, [reachedInvestment, targetAmount]);

  useEffect(() => {
    if (investedAmountData && !isInvestedAmountLoading) {
      const [investedAmount, investorIndex] = investedAmountData as [bigint, bigint];
      if (typeof investedAmount === 'bigint') {
        const formattedInvestedAmount = (Number(investedAmount) / 1e6).toFixed(2);
        setInvestedAmount(formattedInvestedAmount);
        setHasInvested(Number(investedAmount) > 0);
      } else {
        console.error('Invalid invested amount data:', investedAmount);
        setInvestedAmount('0.00');
        setHasInvested(false);
      }
    }
  }, [investedAmountData, isInvestedAmountLoading]);

  useEffect(() => {
    if (claimableTokensData !== undefined && !isClaimableTokensLoading) {
      const claimableTokens = typeof claimableTokensData === 'bigint' 
        ? Number(claimableTokensData)
        : Number(claimableTokensData.toString());
      setHasMinted(claimableTokens === 0);
    }
  }, [claimableTokensData, isClaimableTokensLoading]);

  const investmentProgress = targetAmount > 0 ? (reachedInvestment / targetAmount) * 100 : 0;

  const getColorsForCreditScore = (score: number): [string, string, string] => {
    if (score <= 30) return ['#ff7a86', '#e12836', '#a81d27'];
    if (score <= 50) return ['#ffb77d', '#e55f0b', '#a84508'];
    if (score <= 70) return ['#ffeb99', '#fbd932', '#c7ab26'];
    if (score <= 90) return ['#a1ecc5', '#4fc484', '#3a9362'];
    return ['#7da1ff', '#1c54b9', '#143c85'];
  };

  const [startColor, midColor, endColor] = getColorsForCreditScore(animatedCreditScore);

  const getProgressBarColor = (progress: number, bondState: BondState) => {
    if (bondState === BondState.Minting) {
      return '#1C54B9';
    }
    return progress < 10 ? '#e55f0b' : '#4fc484';
  };

  const progressBarColor = getProgressBarColor(investmentProgress, bondState);
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

  const handleCheckDetails = () => {
    navigate(`/primary-market/${data.isin}`);
  };

  const handleInvestOrMintOrKYC = () => {
    if (!account) {
      // TODO: Implement wallet connection logic
      console.log("Wallet connection functionality to be implemented");
    } else if (!isKYCCompleted) {
      navigate('/kyc');
    } else if (bondState === BondState.Minting && hasInvested) {
      setIsMintPopupOpen(true);
    } else if (bondState === BondState.PaymentPending) {
      setIsInvestmentPopupOpen(true);
    }
  };

  const handleMint = () => {
    // TODO: Implement minting logic
    console.log("Minting functionality to be implemented");
    setIsMintPopupOpen(false);
  };

  const getButtonLabel = () => {
    if (!account) return "Connect Wallet";
    if (!isKYCCompleted) return "Complete KYC";
    switch (bondState) {
      case BondState.PaymentPending:
        return "Invest Now";
      case BondState.Purchase:
        return "Waiting Bond Purchase";
      case BondState.Minting:
        if (!hasInvested) return "You haven't invested";
        if (hasMinted) return "Already Minted";
        return "Mint Now";
      default:
        return "Invest Now";
    }
  };

  const isButtonDisabled = () => {
    if (!account) return true;
    if (!isKYCCompleted) return false;
    if (bondState === BondState.Purchase) return true;
    if (bondState === BondState.Minting && (!hasInvested || hasMinted)) return true;
    return false;
  };

  const getButtonIntent = () => {
    if (!account) return "secondary";
    if (!isKYCCompleted) return "secondary";
    if (bondState === BondState.Purchase) return "secondary";
    if (bondState === BondState.Minting && (!hasInvested || hasMinted)) return "secondary";
    return "primary";
  };

  const getButtonStyle = () => {
    if (bondState === BondState.Purchase) {
      return "opacity-50 cursor-not-allowed bg-gray-400 text-white";
    }
    return "";
  };

  const getStatusIcon = () => {
    switch (bondState) {
      case BondState.PaymentPending:
        return '/assets/OrangeStatus.png';
      case BondState.Purchase:
        return '/assets/GreenStatus.png';
      case BondState.Minting:
        return '/assets/BlueStatus.png';
    }
  };

  const getStatusText = () => {
    switch (bondState) {
      case BondState.PaymentPending:
        return 'Payment Pending Phase';
      case BondState.Purchase:
        return 'Purchase Phase';
      case BondState.Minting:
        return 'Minting Phase';
    }
  };

  const getCurrentPrice = () => {
    return bondState === BondState.Minting ? realizedPrice : data.currentPrice.toString();
  };

  const getCurrentYTM = () => {
    return currentYTM;
  };

  const getPhaseDescription = () => {
    switch (bondState) {
      case BondState.PaymentPending:
        return "In this phase, investors can contribute funds to the smart contract to secure their share in the bond offering.";
      case BondState.Purchase:
        return "The funding target has been reached. The platform is now purchasing the bonds in the traditional market.";
      case BondState.Minting:
        return "Bonds have been purchased. Investors who contributed can now mint their bond tokens.";
    }
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
              label={getButtonLabel()}
              intent={getButtonIntent()}
              size="small" 
              className={`w-36 xs:w-28 lg:w-40 py-0.5 text-[14px] xl:text-[14px] lg:text-[12px] md:text-[12px] sm:text-[12px] xs:text-[11px] ${isButtonDisabled() && 'opacity-50 cursor-not-allowed'} ${getButtonStyle()}`}
              onClick={handleInvestOrMintOrKYC}
              disabled={isButtonDisabled()}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-auto">
          {/* Column 1 and 2 wrapper */}
          <div className="flex flex-col md:flex-row lg:w-3/5 mb-4 lg:mb-0">
            {/* Column 1: Bond Details */}
            <div className="w-full md:w-2/6 lg:w-1/3 flex flex-row md:flex-col justify-between md:justify-center mb-2 md:mb-0">
              <div className="flex flex-col lg:flex-col items-center lg:items-center justify-center lg:justify-center h-full">
                <h2 className="text-[14px] xl:text-[14px] lg:text-[12px] md:text-[11px] sm:text-[10px] xs:text-[9px] text-[#1c544e] text-center">
                  {bondState === BondState.Minting ? "Realized Price" : "Current Price"}
                </h2>
                <p className="text-[24px] xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] xs:text-[16px] font-bold text-[#1c544e]">
                  ${getCurrentPrice()}
                </p>
              </div>
              <div className="flex flex-col lg:flex-col items-center lg:items-center justify-center lg:justify-center h-full md:my-4">
                <h2 className="text-[14px] xl:text-[14px] lg:text-[12px] md:text-[11px] sm:text-[10px] xs:text-[9px] text-[#1c544e] text-center">
                  {bondState === BondState.Minting ? "Realized YTM" : "Yield to Maturity"}
                </h2>
                <p className="text-[24px] xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] xs:text-[16px] font-bold text-[#1c544e]">
                  {getCurrentYTM().toFixed(2)}%
                </p>
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
                    <div className="relative mr-1">
                      <InformationSquareIcon 
                        className="h-4 w-4 text-app-primary-2 cursor-help"
                        onMouseEnter={() => setShowPhaseInfo(true)}
                        onMouseLeave={() => setShowPhaseInfo(false)}
                      />
                      {showPhaseInfo && (
                        <PhaseTooltip description={getPhaseDescription()} />
                      )}
                    </div>
                    <span className="text-[14px] xl:text-[14px] lg:text-[13px] md:text-[13px] sm:text-[14px] xs:text-[12px] font-semibold text-[#1c544e] mr-2">{getStatusText()}</span>
                    <img 
                      src={getStatusIcon()} 
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
                      backgroundColor: getProgressBarColor(investmentProgress, bondState),
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
      
      {isKYCCompleted && isInvestmentPopupOpen && (
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

      {isKYCCompleted && isMintPopupOpen && (
        <MintNowPopup
          onClose={() => setIsMintPopupOpen(false)}
          bondData={{
            companyName,
            couponPercentage: data.couponPercentage, // Add this line
            maturityDate,
            contractAddress,
          }}
        />
      )}
    </div>
  );
};
