import { useState, useEffect } from 'react';
import { useContract, useContractRead } from "@thirdweb-dev/react";
import { BOND_CONTRACT_ADDRESS, contractABI } from '../constants/contractInfo';
import { useContractInfo } from './useContractInfo';

export interface Bond {
  companyName: string;
  companyLogo: string;
  bondYield: number;
  maturityDate: string;
  investmentProgress: number;
  creditScore: number;
  currentPrice: number;
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
}

export const usePrimaryMarketBonds = () => {
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { contract } = useContract(BOND_CONTRACT_ADDRESS, contractABI);
  const { contractBalance, targetAmount, daysRemaining, isLoading: isContractInfoLoading, error: contractInfoError } = useContractInfo();

  const { data: minimumInvestmentAmountData, isLoading: isMinInvestmentLoading, error: minInvestmentError } = useContractRead(contract, "minimumInvestmentAmount");

  useEffect(() => {
    const fetchBondData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (contractInfoError) throw contractInfoError;
        if (minInvestmentError) throw minInvestmentError;

        if (!isContractInfoLoading && !isMinInvestmentLoading && contractBalance && targetAmount && minimumInvestmentAmountData) {
          const zetaBond: Bond = {
            companyName: "Zeta Corporation",
            companyLogo: "/assets/CompanyLogos/ZetaCorporationLogo.png",
            bondYield: 12.7,
            maturityDate: "2026-06-18",
            investmentProgress: (parseFloat(contractBalance) / parseFloat(targetAmount)) * 100,
            creditScore: 72,
            currentPrice: 92.23,
            totalInvestmentTarget: parseFloat(targetAmount),
            reachedInvestment: parseFloat(contractBalance),
            daysUntilDeadline: daysRemaining,
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
            companyDescription: "Zeta Corporation is a leading innovator in renewable energy solutions, specializing in solar and wind power technologies.",
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
            contractAddress: BOND_CONTRACT_ADDRESS,
          };

          const mockBonds: Bond[] = [
            {
              companyName: "Alpha Technologies",
              companyLogo: "/assets/alpha-logo.png",
              bondYield: 10.5,
              maturityDate: "2027-03-15",
              investmentProgress: 0,
              creditScore: 80,
              currentPrice: 95.75,
              totalInvestmentTarget: 0,
              reachedInvestment: 0,
              daysUntilDeadline: 0,
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
              companyDescription: "Alpha Technologies is a global leader in artificial intelligence and machine learning solutions.",
              isin: "US0378331005",
              country: "United States",
              financialMetricsPdfLink: "https://www.bondifinance.io/assets/alpha-financials.pdf",
              modificationCriteria: {
                CurrencyDevaluationRisk: "Low",
                IndustryRisk: "A",
                CompetitivePosition: "Strong",
                DebtFeatures: "Senior Secured",
                ComparativeSpread: "5.234%",
              },
              couponDates: calculateCouponDates("2027-03-15"),
              contractAddress: "",
            },
            {
              companyName: "Beta Pharmaceuticals",
              companyLogo: "/assets/beta-logo.png",
              bondYield: 11.2,
              maturityDate: "2028-09-30",
              investmentProgress: 0,
              creditScore: 68,
              currentPrice: 89.50,
              totalInvestmentTarget: 0,
              reachedInvestment: 0,
              daysUntilDeadline: 0,
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
              companyDescription: "Beta Pharmaceuticals is a leading biopharmaceutical company focused on developing innovative therapies for rare diseases.",
              isin: "US0231351067",
              country: "Brazil",
              financialMetricsPdfLink: "https://www.bondifinance.io/assets/beta-financials.pdf",
              modificationCriteria: {
                CurrencyDevaluationRisk: "Medium",
                IndustryRisk: "BBB",
                CompetitivePosition: "Moderate",
                DebtFeatures: "Subordinated",
                ComparativeSpread: "6.789%",
              },
              couponDates: calculateCouponDates("2028-09-30"),
              contractAddress: "",
            },
          ];

          setBonds([zetaBond, ...mockBonds]);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBondData();
  }, [contractBalance, targetAmount, minimumInvestmentAmountData, daysRemaining, isContractInfoLoading, isMinInvestmentLoading, contractInfoError, minInvestmentError]);

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