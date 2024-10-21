import React, { useState, useEffect } from "react";
import {
  CancelSquareIcon,
  SquareUnlock01Icon,
  SquareLock01Icon,
  Exchange01Icon,
} from "@hugeicons/react";
import {
  useActiveAccount,
  useReadContract,
  useSendTransaction,
} from "thirdweb/react";
import { getContract, prepareContractCall, waitForReceipt } from "thirdweb";
import { MOCK_USDC_ADDRESS, mockUsdcABI } from "../../constants/contractInfo";
import { useContractInfo } from "../../hooks/useContractInfo";
import { useNavigate } from "react-router-dom";
import "react-circular-progressbar/dist/styles.css";
import { baseSepolia } from "thirdweb/chains";
import { client } from "../../client";
import { parseUnits } from "viem";
import { useNotifications } from "../../components/contexts/NotificationContext";

interface InvestmentPopupProps {
  onClose: () => void;
  bondData: {
    companyName: string;
    companyLogo: string;
    maturityDate: string;
    currentPrice: number;
    isin: string;
    contractAddress: string;
    bondTokenAddress: string;
    ogNftAddress: string;
    whaleNftAddress: string;
    bondYield: number;
  };
}

const InvestmentPopup: React.FC<InvestmentPopupProps> = ({
  onClose,
  bondData,
}) => {
  const [amount, setAmount] = useState<string>("0.0000");
  const [isUSDC, setIsUSDC] = useState<boolean>(true);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [investedAmount, setInvestedAmount] = useState<string>("0.00");
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isInvesting, setIsInvesting] = useState(false);
  const [isInvestmentComplete, setIsInvestmentComplete] = useState(false);
  const [isOGNFTUnlocked, setIsOGNFTUnlocked] = useState(false);
  const [isWhaleNFTUnlocked, setIsWhaleNFTUnlocked] = useState(false);
  const [isAmountValid, setIsAmountValid] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState<bigint>(BigInt(0));
  const [isTransactionInProgress, setIsTransactionInProgress] = useState(false);
  const [isApprovalPending, setIsApprovalPending] = useState(false);

  const account = useActiveAccount();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const {
    minInvestmentAmount,
    isLoading: isContractInfoLoading,
    contractAddress,
    ogNftAddress,
    whaleNftAddress,
    fundingContract,
  } = useContractInfo(bondData.contractAddress);

  const usdcContract = getContract({
    client,
    address: MOCK_USDC_ADDRESS,
    abi: mockUsdcABI,
    chain: baseSepolia,
  });

  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    refetch: refetchBalanceData,
  } = useReadContract({
    contract: usdcContract,
    method: "balanceOf",
    params: [account?.address || "0x"],
  });

  const {
    data: allowanceData,
    isLoading: isAllowanceLoading,
    refetch: refetchAllowance,
  } = useReadContract({
    contract: usdcContract,
    method: "allowance",
    params: [account?.address || "0x", contractAddress],
  });

  const { data: investedAmountData, isLoading: isInvestedAmountLoading } =
    useReadContract({
      contract: fundingContract,
      method: "investedAmountPerInvestor",
      params: [account?.address || "0x"],
    });

  const { mutateAsync: sendTx } = useSendTransaction();

  const WHALE_THRESHOLD = BigInt(5000 * 1e6); // 5000 USDC in wei

  useEffect(() => {
    const fetchAllowance = async () => {
      if (allowanceData) {
        const allowanceValue =
          typeof allowanceData === "bigint"
            ? allowanceData
            : BigInt(allowanceData.toString());

        setApprovedAmount(allowanceValue);
        setIsApproved(allowanceValue > BigInt(0));
        setIsApprovalPending(false);
      }
    };

    fetchAllowance();
  }, [allowanceData]);

  useEffect(() => {
    if (investedAmountData) {
      // investedAmountData is now an array with two elements
      const [investedAmount] = investedAmountData as [bigint];

      if (typeof investedAmount === "bigint") {
        const formattedInvestedAmount = (Number(investedAmount) / 1e6).toFixed(
          2
        );
        setInvestedAmount(formattedInvestedAmount);
      } else {
        console.error("Invalid invested amount data:", investedAmount);
        setInvestedAmount("0.00");
      }
    }
  }, [investedAmountData]);

  useEffect(() => {
    if (isInvestmentComplete) {
      setIsOGNFTUnlocked(true);

      // Calculate total invested amount (previous investment + current investment)
      const previousInvestment = BigInt(
        Math.floor(parseFloat(investedAmount) * 1e6)
      );
      const currentInvestment = BigInt(Math.floor(parseFloat(amount) * 1e6));
      const totalInvestment = previousInvestment + currentInvestment;

      setIsWhaleNFTUnlocked(totalInvestment >= WHALE_THRESHOLD);
    }
  }, [isInvestmentComplete, amount, investedAmount]);

  useEffect(() => {
    if (!isContractInfoLoading && minInvestmentAmount) {
      const amountInUSDC = isUSDC
        ? parseFloat(amount)
        : parseFloat(amount) * bondData.currentPrice;
      setIsAmountValid(amountInUSDC >= parseFloat(minInvestmentAmount));
    }
  }, [
    amount,
    isUSDC,
    minInvestmentAmount,
    isContractInfoLoading,
    bondData.currentPrice,
  ]);

  useEffect(() => {
    if (isInvestmentComplete) {
      refetchBalanceData();
    }
  }, [isInvestmentComplete, refetchBalanceData]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number): string => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    const parts = value.split(".");
    if (parts.length > 1) {
      parts[1] = parts[1].slice(0, 4); // Limit to 4 decimal places
    }
    setAmount(parts.join("."));
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (amount === "0.0000") {
      setAmount("");
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    if (amount === "" || parseFloat(amount) === 0) {
      setAmount("0.0000");
    } else {
      // Ensure 4 decimal places are always shown
      setAmount(parseFloat(amount).toFixed(4));
    }
  };

  const handleMaxClick = () => {
    if (isUSDC && balanceData) {
      setAmount((Number(balanceData) / 1e6).toFixed(4));
    } else if (balanceData) {
      setAmount((Number(balanceData) / 1e6 / bondData.currentPrice).toFixed(4));
    }
  };

  const toggleCurrency = () => {
    setIsUSDC(!isUSDC);
    if (amount !== "0.0000" && amount !== "") {
      if (isUSDC) {
        setAmount((parseFloat(amount) / bondData.currentPrice).toFixed(4));
      } else {
        setAmount((parseFloat(amount) * bondData.currentPrice).toFixed(4));
      }
    }
  };

  const calculateEquivalent = (): string => {
    const value = parseFloat(amount) || 0;
    if (isUSDC) {
      return `${formatNumber(value / bondData.currentPrice)} ${bondTokenName}`;
    } else {
      return `${formatNumber(value * bondData.currentPrice)} USDC`;
    }
  };

  // Get the first word of the company name for the bond token representation
  const bondTokenName = `bt${bondData.companyName.split(" ")[0].toUpperCase()}`;

  // Get today's date
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleApprove = async () => {
    if (!account) {
      addNotification({
        title: "Action Required",
        message: "Please connect your wallet to approve USDC",
      });
      return;
    }
    setIsApproving(true);
    setIsApprovalPending(true);
    try {
      const amountToApprove = parseUnits(amount, 6); // USDC has 6 decimal places

      const transaction = await prepareContractCall({
        contract: usdcContract,
        method:
          "function approve(address spender, uint256 amount) external returns (bool)",
        params: [fundingContract.address, amountToApprove],
      });

      await sendTx(transaction);
      await refetchAllowance();
      addNotification({
        title: "Approval Successful",
        message: `USDC spending of ${amount} approved for investment.`,
      });
    } catch (error) {
      console.error("Error approving Mock USDC:", error);
      addNotification({
        title: "Approval Failed",
        message: `Error approving USDC: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      setIsApprovalPending(false);
    } finally {
      setIsApproving(false);
    }
  };

  const handleInvest = async () => {
    if (!account || !amount || amount === "0.0000") {
      addNotification({
        title: "Action Required",
        message:
          "Please connect your wallet and enter a valid investment amount",
      });
      return;
    }

    const amountToInvest = parseUnits(amount, 6); // USDC has 6 decimal places

    if (amountToInvest > approvedAmount) {
      addNotification({
        title: "Action Required",
        message: "Please approve the required amount before investing",
      });
      return;
    }

    setIsInvesting(true);
    try {
      if (amountToInvest < parseUnits(minInvestmentAmount, 6)) {
        throw new Error(
          `Minimum investment amount is ${minInvestmentAmount} USDC`
        );
      }

      const transaction = await prepareContractCall({
        contract: fundingContract,
        method: "function invest(uint256 amount) external returns (bool)",
        params: [amountToInvest],
      });
      const tx = await sendTx(transaction);

      await waitForReceipt({
        client,
        chain: baseSepolia,
        transactionHash: tx.transactionHash,
      });

      setIsInvestmentComplete(true);
      setIsOGNFTUnlocked(true);

      const previousInvestment = BigInt(
        Math.floor(parseFloat(investedAmount) * 1e6)
      );
      const totalInvestment = previousInvestment + amountToInvest;
      setIsWhaleNFTUnlocked(totalInvestment >= WHALE_THRESHOLD);

      addNotification({
        title: "Investment Successful",
        message: `Successfully invested ${amount} USDC in ${bondData.companyName} bond.`,
      });

      // Reset approval after successful investment
      setIsApproved(false);
      setApprovedAmount(BigInt(0));
      await refetchAllowance();
      setAmount("0.0000"); // Reset the amount input
    } catch (error: any) {
      console.error("Error investing:", error);
      addNotification({
        title: "Investment Failed",
        message: `Error investing: ${error.message || "Unknown error"}`,
      });
    } finally {
      setIsInvesting(false);
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-[#F2FBF9] rounded-xl w-full max-w-5xl h-[95vh] relative flex flex-col overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#1C544E] hover:text-[#3EBAAD] transition-colors z-10"
        >
          <CancelSquareIcon
            size={34}
            variant="solid"
            className="transition-colors duration-200"
            color="currentColor"
          />
        </button>

        <div className="flex h-full relative">
          {/* Left Panel */}
          <div className="w-1/2 overflow-y-auto relative">
            {isInvestmentComplete ? (
              <div className="h-full bg-[#071f1e] flex flex-col items-center justify-center relative">
                <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#d8feaa] to-transparent opacity-30 rounded-t-md"></div>
                <div className="flex flex-col items-center space-y-12 p-8 relative z-10">
                  <div className="flex items-center">
                    <div className="w-16">
                      {isOGNFTUnlocked ? (
                        <SquareUnlock01Icon
                          size={64}
                          color="#d8feaa"
                          variant="solid"
                        />
                      ) : (
                        <SquareLock01Icon
                          size={64}
                          color="#f2fbf9"
                          variant="solid"
                        />
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-[#f2fbf9] text-[22px] font-bold">
                        OG NFT
                      </h3>
                      <p className="text-[#f2fbf9] text-[14px] mt-1 opacity-70">
                        Make your first investment in this funding contract
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-16">
                      {isWhaleNFTUnlocked ? (
                        <SquareUnlock01Icon
                          size={64}
                          color="#d8feaa"
                          variant="solid"
                        />
                      ) : (
                        <SquareLock01Icon
                          size={64}
                          color="#f2fbf9"
                          variant="solid"
                        />
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-[#f2fbf9] text-[22px] font-bold">
                        Whale NFT
                      </h3>
                      <p className="text-[#f2fbf9] text-[14px] mt-1 opacity-70">
                        Total investment of at least 5,000 USDC
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Original left panel content (investment details)
              <div className="h-full flex flex-col justify-center p-8">
                <div className="mb-4">
                  <img
                    src={bondData.companyLogo}
                    alt={`${bondData.companyName} logo`}
                    className="w-14 h-14"
                  />
                </div>
                <h2 className="text-[#1C544E] text-[26px] font-medium">
                  Invest in
                </h2>
                <h1 className="text-[#1C544E] text-[26px] font-bold mb-8">
                  {bondTokenName}
                </h1>

                <div className="space-y-2 text-sm text-[#1C544E]">
                  <div className="flex justify-between">
                    <span>Bond Price:</span>
                    <span>{formatCurrency(bondData.currentPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Yield to Maturity:</span>
                    <span>{bondData.bondYield.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maturity Date:</span>
                    <span>{bondData.maturityDate}</span>
                  </div>
                </div>

                <h3 className="mt-8 mb-4 text-[#1C544E] text-base font-bold">
                  Description
                </h3>
                <ol className="list-decimal list-inside space-y-4 text-[14px] text-[#1C544E]">
                  <div>
                    You can buy Bond Tokens (BTs) by contributing to the funding
                    contracts. Here’s how it works:
                  </div>
                  <li>
                    You can send your funds to the smart contract during this
                    period to secure your share in the bond offering.
                  </li>
                  <li>
                    Once the funding target is reached, bond tokens (BTs) will
                    be available for you to claim directly from the platform.
                  </li>
                  <li>
                    If the funding target isn’t reached by the deadline, you’ll
                    automatically get a refund, with your funds returned to your
                    wallet.
                  </li>
                  <div>
                    As a bonus, when you make your first deposit, you’ll receive
                    an OG NFT as a reward. And if you deposit $5,000 or more,
                    you’ll unlock a special Whale NFT, which will guarantee your
                    allocation in the future Bondi protocol token.
                  </div>
                </ol>
              </div>
            )}
          </div>

          {/* Middle line with shadow effect only to the left */}
          {!isInvestmentComplete && (
            <div className="absolute top-0 bottom-0 right-1/2 w-6 pointer-events-none">
              <div className="absolute top-0 bottom-0 w-6 bg-gradient-to-l from-[#E0E0E0] to-transparent opacity-30"></div>
            </div>
          )}

          {/* Right Panel */}
          <div className="w-1/2 p-8 overflow-y-auto flex flex-col">
            {isInvestmentComplete ? (
              <div className="flex-grow flex flex-col justify-between items-center text-center">
                <div className="w-full">
                  <h2 className="text-[22px] font-bold text-[#1C544E] mb-16">
                    Congratulations!
                  </h2>
                  <div className="space-y-6">
                    <p className="text-lg text-[#1C544E]">
                      Thank you for committing your investment in the{" "}
                      {bondTokenName} funding phase!
                    </p>
                    <p className="text-md text-[#1C544E]">
                      As a participant in Bondi's inaugural funding round,
                      you've earned the exclusive OG NFT and secured your
                      allocation for the upcoming Bondi protocol token.
                    </p>
                    <p className="text-md text-[#1C544E]">
                      Once the target amount is reached, you'll be able to claim
                      your Bond Tokens.
                    </p>
                  </div>
                </div>
                <div className="w-full px-16 mt-16">
                  <button
                    onClick={handleGoHome}
                    className="w-full bg-[#1C544E] text-white text-xl font-medium py-4 rounded-xl hover:bg-[#164039] transition-colors duration-300"
                  >
                    Go Home
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-grow flex flex-col justify-center">
                  <div className="mb-2">
                    <div className="flex justify-between items-end mb-2">
                      <label
                        htmlFor="amount"
                        className="text-[24px] font-medium text-[#1C544E]"
                      >
                        Amount
                      </label>
                      <div className="text-right">
                        <p className="text-[#1C544E] text-xs mb-1">{today}</p>
                        <p className="text-[#1C544E] text-sm font-bold">
                          1 {bondTokenName} ={" "}
                          {formatCurrency(bondData.currentPrice)}
                        </p>
                      </div>
                    </div>
                    <div className="relative mt-2">
                      <input
                        type="text"
                        id="amount"
                        value={
                          isFocused
                            ? amount
                            : `${amount} ${isUSDC ? "USDC" : bondTokenName}`
                        }
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className="w-full p-4 border border-[#1C544E] rounded-xl text-xl font-bold text-[#1C544E] opacity-70"
                      />
                      <button
                        onClick={toggleCurrency}
                        className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-[#D4E7E2] text-[#1C544E] p-2 rounded-xl hover:bg-[#B3D1C8] transition-colors duration-300"
                      >
                        <Exchange01Icon
                          size={24}
                          className="transition-transform duration-300 hover:rotate-180"
                        />
                      </button>
                      <button
                        onClick={handleMaxClick}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#D4E7E2] text-[#1C544E] px-4 py-2 rounded-xl font-bold hover:bg-[#B3D1C8] transition-colors duration-300"
                      >
                        Max
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-[#1C544E] opacity-60 mb-2">
                    {calculateEquivalent()}
                  </p>
                  {!isAmountValid && (
                    <p className="text-sm text-red-500 mb-4">
                      Please enter at least the minimum investment amount.
                    </p>
                  )}
                  <div className="space-y-4 text-xs text-[#1C544E] mb-8">
                    <div className="flex justify-between items-center">
                      <span>Minimum investment:</span>
                      <p className="font-bold">
                        {isContractInfoLoading
                          ? "Loading..."
                          : `${formatCurrency(
                              parseFloat(minInvestmentAmount)
                            )} USDC`}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Your Balance:</span>
                      <p className="font-bold">
                        {isBalanceLoading
                          ? "Loading..."
                          : `${formatCurrency(Number(balanceData) / 1e6)} USDC`}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Already Invested:</span>
                      <p className="font-bold">
                        {isInvestedAmountLoading
                          ? "Loading..."
                          : `${formatCurrency(
                              parseFloat(investedAmount)
                            )} USDC`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <p className="text-[9px] text-[#1C544E] mb-4">
                    Please note that the price and Yield to Maturity (YTM)
                    indicated during the Funding Phase are provisional and do
                    not represent the final figures. Once the bonds are
                    purchased in real life, you will be notified, and the
                    realized price and YTM will be displayed when you mint your
                    bond tokens.
                  </p>

                  {isApproved &&
                  amount &&
                  amount !== "0.0000" &&
                  BigInt(Math.floor(parseFloat(amount) * 1e6)) <=
                    approvedAmount ? (
                    <button
                      onClick={handleInvest}
                      disabled={isInvesting || !isAmountValid}
                      className="w-full bg-[#1C544E] text-white text-xl font-medium py-4 rounded-xl hover:bg-[#164039] transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isInvesting ? "Investing..." : "Invest"}
                    </button>
                  ) : (
                    <button
                      onClick={handleApprove}
                      disabled={
                        isApproving ||
                        !isAmountValid ||
                        !amount ||
                        amount === "0.0000" ||
                        isApprovalPending
                      }
                      className="w-full bg-[#1C544E] text-white text-xl font-medium py-4 rounded-xl hover:bg-[#164039] transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isApproving
                        ? "Approving..."
                        : isApprovalPending
                        ? "Approval Pending..."
                        : "Approve USDC"}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentPopup;
