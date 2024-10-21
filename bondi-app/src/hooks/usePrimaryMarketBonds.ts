import { useState, useEffect } from 'react';
import { useContractInfo } from './useContractInfo';
import { ZETA_FUNDING_CONTRACT, ALPHA_FUNDING_CONTRACT, BETA_FUNDING_CONTRACT } from '../constants/contractInfo';

export interface Bond {
  companyName: string;
  companyLogo: string;
  couponPercentage: number;
  maturityDate: string;
  investmentProgress: number;
  creditScore: number;
  currentPrice: number;
  faceValue: number;
  totalInvestmentTarget: number;
  reachedInvestment: number;
  daysUntilDeadline: number | null;
  financialMetrics: {
    WorkingCapital: string;
    TotalDebt: string;
    TotalAssets: string;
    TotalLiabilities: string;
    RetainedEarnings: string;
    OperatingIncome: string;
    BookValue: string;
  };
  financialMetricsPeriod: string;
  companyDescription: string;
  isin: string;
  country: string;
  financialMetricsPdfLink: string;
  modificationCriteria: {
    CurrencyDevaluationRisk: string;
    IndustryRisk: string;
    CompetitivePosition: string;
    DebtFeatures: string;
    ComparativeSpread: string;
  };
  couponDates: string[];
  contractAddress: string;
  bondTokenAddress: string;
  ogNftAddress: string;
  whaleNftAddress: string;
  bondYield: number;
}

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

export const usePrimaryMarketBonds = () => {
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const zeta = useContractInfo(ZETA_FUNDING_CONTRACT);
  const alpha = useContractInfo(ALPHA_FUNDING_CONTRACT);
  const beta = useContractInfo(BETA_FUNDING_CONTRACT);

  useEffect(() => {
    const fetchBondData = async () => {
      if (zeta.isLoading || alpha.isLoading || beta.isLoading) return;

      setIsLoading(true);
      setError(null);

      try {
        if (zeta.error) throw zeta.error;
        if (alpha.error) throw alpha.error;
        if (beta.error) throw beta.error;

        const zetaBond: Bond = {
          companyName: "Zeta Corporation",
          companyLogo: "/assets/CompanyLogos/ZetaCorporationLogo.png",
          couponPercentage: 8, // 8% coupon
          maturityDate: "2026-06-18",
          investmentProgress: (parseFloat(zeta.contractBalance) / parseFloat(zeta.targetAmount)) * 100,
          creditScore: 72,
          currentPrice: 92.23,
          faceValue: 100,
          totalInvestmentTarget: parseFloat(zeta.targetAmount),
          reachedInvestment: parseFloat(zeta.contractBalance),
          daysUntilDeadline: zeta.daysRemaining,
          financialMetrics: {
            WorkingCapital: "$529,509,720",
            TotalDebt: "$992,820,540",
            TotalAssets: "$1,369,844,570",
            TotalLiabilities: "$992,820,540",
            RetainedEarnings: "$80,551,291",
            OperatingIncome: "$182,922,023",
            BookValue: "$377,024,030",
          },
          financialMetricsPeriod: "Q2 2023",
          companyDescription: "Zeta Corporation is a leading conglomerate in energy and infrastructure across Latin America. Founded in 1945, it specializes in renewable energy solutions and large-scale projects.",
          isin: "USX101D4YWZ1",
          country: "Argentina",
          financialMetricsPdfLink: "https://www.bondifinance.io/assets/whitepaper.pdf",
          modificationCriteria: {
            CurrencyDevaluationRisk: "High",
            IndustryRisk: "AA",
            CompetitivePosition: "Dominant",
            DebtFeatures: "Unsecured",
            ComparativeSpread: "7.964%",
          },
          couponDates: calculateCouponDates("2026-06-18"),
          contractAddress: ZETA_FUNDING_CONTRACT,
          bondTokenAddress: zeta.bondTokenAddress,
          ogNftAddress: zeta.ogNftAddress,
          whaleNftAddress: zeta.whaleNftAddress,
          bondYield: 0, // Initialize with 0, will be calculated later
        };

        const alphaBond: Bond = {
          companyName: "Alpha Technologies",
          companyLogo: "/assets/CompanyLogos/alphacorp.png",
          couponPercentage: 7, // 7% coupon
          maturityDate: "2027-03-15",
          investmentProgress: (parseFloat(alpha.contractBalance) / parseFloat(alpha.targetAmount)) * 100,
          creditScore: 80,
          currentPrice: 95.75,
          faceValue: 100,
          totalInvestmentTarget: parseFloat(alpha.targetAmount),
          reachedInvestment: parseFloat(alpha.contractBalance),
          daysUntilDeadline: alpha.daysRemaining,
          financialMetrics: {
            WorkingCapital: "$320,000,000",
            TotalDebt: "$750,000,000",
            TotalAssets: "$1,200,000,000",
            TotalLiabilities: "$800,000,000",
            RetainedEarnings: "$150,000,000",
            OperatingIncome: "$220,000,000",
            BookValue: "$400,000,000",
          },
          financialMetricsPeriod: "Q1 2023",
          companyDescription: "Alpha Technologies is a diversified technology and telecommunications giant headquartered in Brazil. Established in 1983, it offers services in telecommunications, cloud computing, IoT, and digital payments.",
          isin: "US0378331005",
          country: "Brazil",
          financialMetricsPdfLink: "https://www.bondifinance.io/assets/alpha-financials.pdf",
          modificationCriteria: {
            CurrencyDevaluationRisk: "Low",
            IndustryRisk: "A",
            CompetitivePosition: "Strong",
            DebtFeatures: "Senior Secured",
            ComparativeSpread: "5.234%",
          },
          couponDates: calculateCouponDates("2027-03-15"),
          contractAddress: ALPHA_FUNDING_CONTRACT,
          bondTokenAddress: alpha.bondTokenAddress,
          ogNftAddress: alpha.ogNftAddress,
          whaleNftAddress: alpha.whaleNftAddress,
          bondYield: 0, // Initialize with 0, will be calculated later
        };

        const betaBond: Bond = {
          companyName: "Beta Pharmaceuticals",
          companyLogo: "/assets/CompanyLogos/betacorp.png",
          couponPercentage: 9, // 9% coupon
          maturityDate: "2028-09-30",
          investmentProgress: (parseFloat(beta.contractBalance) / parseFloat(beta.targetAmount)) * 100,
          creditScore: 68,
          currentPrice: 89.50,
          faceValue: 100,
          totalInvestmentTarget: parseFloat(beta.targetAmount),
          reachedInvestment: parseFloat(beta.contractBalance),
          daysUntilDeadline: beta.daysRemaining,
          financialMetrics: {
            WorkingCapital: "$450,000,000",
            TotalDebt: "$1,200,000,000",
            TotalAssets: "$2,500,000,000",
            TotalLiabilities: "$1,500,000,000",
            RetainedEarnings: "$350,000,000",
            OperatingIncome: "$400,000,000",
            BookValue: "$1,000,000,000",
          },
          financialMetricsPeriod: "Q4 2022",
          companyDescription: "Beta Pharmaceuticals is a leading Latin American healthcare and pharmaceutical conglomerate founded in 1920. The company focuses on pharmaceuticals, medical devices, and healthcare services, with emphasis on tropical disease research.",
          isin: "US0231351067",
          country: "Mexico",
          financialMetricsPdfLink: "https://www.bondifinance.io/assets/beta-financials.pdf",
          modificationCriteria: {
            CurrencyDevaluationRisk: "Medium",
            IndustryRisk: "BBB",
            CompetitivePosition: "Moderate",
            DebtFeatures: "Subordinated",
            ComparativeSpread: "6.789%",
          },
          couponDates: calculateCouponDates("2028-09-30"),
          contractAddress: BETA_FUNDING_CONTRACT,
          bondTokenAddress: beta.bondTokenAddress,
          ogNftAddress: beta.ogNftAddress,
          whaleNftAddress: beta.whaleNftAddress,
          bondYield: 0, // Initialize with 0, will be calculated later
        };

        // Calculate YTM for each bond
        const now = new Date();
        zetaBond.bondYield = parseFloat(calculateYTM(
          zetaBond.couponPercentage,
          zetaBond.faceValue,
          zetaBond.currentPrice,
          (new Date(zetaBond.maturityDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365)
        ).toFixed(2));

        alphaBond.bondYield = parseFloat(calculateYTM(
          alphaBond.couponPercentage,
          alphaBond.faceValue,
          alphaBond.currentPrice,
          (new Date(alphaBond.maturityDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365)
        ).toFixed(2));

        betaBond.bondYield = parseFloat(calculateYTM(
          betaBond.couponPercentage,
          betaBond.faceValue,
          betaBond.currentPrice,
          (new Date(betaBond.maturityDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365)
        ).toFixed(2));

        setBonds([zetaBond, alphaBond, betaBond]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBondData();
  }, [zeta.isLoading, alpha.isLoading, beta.isLoading, zeta.error, alpha.error, beta.error, zeta.contractBalance, alpha.contractBalance, beta.contractBalance, zeta.targetAmount, alpha.targetAmount, beta.targetAmount]);

  return { bonds, isLoading, error };
};

const calculateCouponDates = (maturityDate: string): string[] => {
  const maturity = new Date(maturityDate);
  const couponDates = [];
  let currentDate = maturity;

  while (currentDate > new Date()) {
    couponDates.unshift(currentDate.toISOString().split('T')[0]);
    currentDate.setMonth(currentDate.getMonth() - 6);
  }

  return couponDates.slice(0, 5);
};
