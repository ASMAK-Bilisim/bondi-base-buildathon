import { ethers } from 'ethers';
import { contractABI, contractAddress } from '../constants/contractInfo'; // You'll need to create this file with your contract details

export const fetchPortfolioData = async (address: string, timeRange: string) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(contractAddress, contractABI, provider);

  // Fetch the user's token balance
  const balance = await contract.balanceOf(address);
  const currentValue = ethers.utils.formatEther(balance);

  // For this example, we'll generate mock historical data
  // In a real application, you'd fetch this from your backend or blockchain
  const performanceData = generateMockPerformanceData(timeRange);

  return {
    currentValue: parseFloat(currentValue),
    performanceData,
  };
};

const generateMockPerformanceData = (timeRange: string) => {
  const now = new Date();
  const data = [];
  const dataPoints = timeRange === 'Year to Date' ? 365 : 30; // Adjust based on time range

  for (let i = dataPoints; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.random() * 1000 + 500, // Random value between 500 and 1500
    });
  }

  return data;
};