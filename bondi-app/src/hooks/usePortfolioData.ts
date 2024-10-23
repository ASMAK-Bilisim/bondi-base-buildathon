import { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { subYears, subMonths, subDays, startOfYear, parseISO, isValid } from 'date-fns';

interface ShortQuoteData {
  symbol: string;
  price: number;
  volume: number;
}

interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PerformanceData {
  date: string;
  value: number;
  displayValue: number;
}

const API_KEY = import.meta.env.VITE_FINANCIAL_MODELING_PREP_API_KEY;
const SYMBOL = 'EMHY';

const fetchEMHYPrice = async (): Promise<ShortQuoteData> => {
  const response = await axios.get(`https://financialmodelingprep.com/api/v3/quote-short/${SYMBOL}?apikey=${API_KEY}`);
  return response.data[0];
};

const fetchHistoricalData = async (): Promise<HistoricalData[]> => {
  const response = await axios.get(`https://financialmodelingprep.com/api/v3/historical-price-full/${SYMBOL}?apikey=${API_KEY}`);
  return response.data.historical;
};

const fetch5MinData = async (from: string, to: string): Promise<HistoricalData[]> => {
  const response = await axios.get(`https://financialmodelingprep.com/api/v3/historical-chart/5min/${SYMBOL}?from=${from}&to=${to}&apikey=${API_KEY}`);
  return response.data;
};

const fetch30MinData = async (from: string, to: string): Promise<HistoricalData[]> => {
  const response = await axios.get(`https://financialmodelingprep.com/api/v3/historical-chart/30min/${SYMBOL}?from=${from}&to=${to}&apikey=${API_KEY}`);
  return response.data;
};

export const usePortfolioData = () => {
  const [timeRange, setTimeRange] = useState('YTD');

  const { data: currentPriceData, isLoading: isLoadingCurrentPrice, error: currentPriceError } = useQuery({
    queryKey: ['EMHYPrice'],
    queryFn: fetchEMHYPrice,
    refetchInterval: 60000, // Refetch every minute
  });

  const { data: historicalData, isLoading: isLoadingHistorical, error: historicalError } = useQuery({
    queryKey: ['EMHYHistorical'],
    queryFn: fetchHistoricalData,
    refetchInterval: 24 * 60 * 60 * 1000, // Refetch once a day
  });

  const { data: fiveMinData, isLoading: isLoading5Min, error: error5Min } = useQuery({
    queryKey: ['EMHY5Min', timeRange],
    queryFn: async () => {
      const now = new Date();
      const from = subDays(now, 1);
      return fetch5MinData(from.toISOString().split('T')[0], now.toISOString().split('T')[0]);
    },
    enabled: timeRange === '1 Day',
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const { data: thirtyMinData, isLoading: isLoading30Min, error: error30Min } = useQuery({
    queryKey: ['EMHY30Min', timeRange],
    queryFn: async () => {
      const now = new Date();
      const from = subDays(now, 7);
      return fetch30MinData(from.toISOString().split('T')[0], now.toISOString().split('T')[0]);
    },
    enabled: timeRange === '1 Week',
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  });

  const currentPrice = currentPriceData?.price || 0;

  const performanceData = useMemo(() => {
    if ((!historicalData && !fiveMinData && !thirtyMinData) || !currentPriceData) return [];

    const now = new Date();
    let startDate: Date;
    let dataPoints: number;
    let data: HistoricalData[];

    switch (timeRange) {
      case '1 Day':
        startDate = subDays(now, 1);
        dataPoints = 288; // 5-minute intervals for a day
        data = fiveMinData || [];
        break;
      case '1 Week':
        startDate = subDays(now, 7);
        dataPoints = 336; // 30-minute intervals for a week
        data = thirtyMinData || [];
        break;
      case '1 Month':
        startDate = subMonths(now, 1);
        dataPoints = 168;
        data = historicalData || [];
        break;
      case '6 Months':
        startDate = subMonths(now, 6);
        dataPoints = 180;
        data = historicalData || [];
        break;
      case '1 Year':
        startDate = subYears(now, 1);
        dataPoints = 365;
        data = historicalData || [];
        break;
      case '2 Years':
        startDate = subYears(now, 2);
        dataPoints = 2 * 365;
        data = historicalData || [];
        break;
      case 'YTD':
        startDate = startOfYear(now);
        dataPoints = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        data = historicalData || [];
        break;
      default:
        startDate = subYears(now, 2);
        dataPoints = 2 * 365;
        data = historicalData || [];
    }

    let filteredData = data
      .filter(item => {
        const itemDate = parseISO(item.date);
        return isValid(itemDate) && itemDate >= startDate;
      })
      .map(item => ({
        date: parseISO(item.date).getTime(),
        value: item.close,
        displayValue: item.close, // Keep original value for tooltip
      }))
      .reverse();

    // If we have more data points than needed, reduce them
    if (filteredData.length > dataPoints) {
      const step = Math.floor(filteredData.length / dataPoints);
      filteredData = filteredData.filter((_, index) => index % step === 0);
    }

    // Add current price as the latest data point
    filteredData.push({
      date: new Date().getTime(),
      value: currentPriceData.price,
      displayValue: currentPriceData.price,
    });

    // For shorter time ranges, adjust the y-axis scale to make volatility more pronounced
    if (['1 Day', '1 Week', '1 Month', '6 Months'].includes(timeRange)) {
      const values = filteredData.map(d => d.value);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const padding = (max - min) * 0.1; // Add 10% padding to top and bottom
      filteredData = filteredData.map(d => ({
        ...d,
        value: (d.value - min + padding) / (max - min + 2 * padding),
      }));
    }

    return filteredData;
  }, [historicalData, fiveMinData, thirtyMinData, timeRange, currentPriceData]);

  const isLoading = isLoadingCurrentPrice || isLoadingHistorical || isLoading5Min || isLoading30Min;
  const error = currentPriceError || historicalError || error5Min || error30Min;

  return {
    bondValue: currentPrice,
    performanceData,
    timeRange,
    setTimeRange,
    isLoading,
    error,
  };
};
