import React, { useState, useMemo } from "react";
import { Calendar03Icon, ArrowDown01Icon } from "@hugeicons/react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { usePortfolioData } from "../../hooks/usePortfolioData";
import { format } from 'date-fns';

interface PortfolioPerformanceProps {
  onTimeRangeChange?: (range: string) => void;
  chartName?: string;
  bondPrice?: number;
}

const timeRanges = ["1 Day", "1 Week", "1 Month", "6 Months", "1 Year", "2 Years", "YTD"];

const PortfolioPerformance: React.FC<PortfolioPerformanceProps> = ({
  onTimeRangeChange = () => {},
  chartName = "BTC/USD Price",
  bondPrice
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { performanceData, timeRange, setTimeRange, isLoading, error } = usePortfolioData();

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    onTimeRangeChange(range);
    setIsDropdownOpen(false);
  };

  const formatTooltipLabel = (value: number) => {
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', value);
        return 'Invalid Date';
      }
      return timeRange === '1 Day' ? format(date, 'MMM dd HH:mm') : format(date, 'MMM dd yyyy');
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Error';
    }
  };

  const formatTooltipValue = (value: number, name: string, props: { payload: { displayValue: number } }) => {
    return [`$${props.payload.displayValue.toFixed(2)}`, 'Price'];
  };

  const chartData = useMemo(() => {
    return performanceData.map(item => ({
      ...item,
      date: new Date(item.date).getTime(), // Convert to timestamp for XAxis
    }));
  }, [performanceData]);

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-full">Loading...</div>;
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-full text-center">
          Error loading portfolio data
        </div>
      );
    }

    return (
      <>
        <header className="flex gap-5 justify-between w-full mb-4 3xl:mb-5 4xl:mb-6">
          <div className="flex gap-2.5 text-xs 3xl:text-sm 4xl:text-base leading-none text-right">
            <h1 className="my-auto basis-auto">{chartName}</h1>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between gap-1 px-2 py-1 text-[10px] rounded-md border-teal-900 border-solid border-[0.5px] min-h-[19px] cursor-pointer min-w-[80px]"
            >
              <div className="flex items-center gap-1">
                <Calendar03Icon className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{timeRange}</span>
              </div>
              <ArrowDown01Icon className="w-3 h-3 flex-shrink-0" />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 bg-white border border-teal-900 rounded-md shadow-lg z-10 min-w-[80px] overflow-hidden">
                {timeRanges.map((range, index) => (
                  <button
                    key={range}
                    onClick={() => handleTimeRangeChange(range)}
                    className={`block w-full text-left px-4 py-2 text-[10px] hover:bg-teal-50 truncate
                      ${index === 0 ? 'rounded-t-md' : ''}
                      ${index === timeRanges.length - 1 ? 'rounded-b-md' : ''}
                    `}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>
        <p className="self-start text-2xl 3xl:text-3xl 4xl:text-4xl font-extrabold leading-10 text-right">
          ${bondPrice ? bondPrice.toFixed(2) : 'N/A'}
        </p>
        <div className="h-44 3xl:h-52 4xl:h-60 w-full mt-4 3xl:mt-5 4xl:mt-6">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1C544E" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#1C544E" stopOpacity={0.07}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(tick) => format(new Date(tick), 'MMM dd')}
                  hide
                />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  labelFormatter={formatTooltipLabel}
                  formatter={formatTooltipValue}
                  contentStyle={{ background: '#F2FBF9', border: '1px solid #1C544E' }}
                  labelStyle={{ color: '#1C544E' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Price"
                  stroke="#1C544E"
                  strokeWidth={2}
                  fill="url(#colorValue)"
                  fillOpacity={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-full">No data available</div>
          )}
        </div>
        <footer className="flex gap-5 justify-between mt-2 text-xs leading-none text-teal-900 text-opacity-80">
          {chartData[0]?.date && (
            <time dateTime={new Date(chartData[0].date).toISOString()}>
              {formatTooltipLabel(chartData[0].date)}
            </time>
          )}
          {chartData[chartData.length - 1]?.date && (
            <time dateTime={new Date(chartData[chartData.length - 1].date).toISOString()}>
              {formatTooltipLabel(chartData[chartData.length - 1].date)}
            </time>
          )}
        </footer>
      </>
    );
  };

  return (
    <section className="flex overflow-hidden flex-col px-6 3xl:px-5 4xl:px-4 pt-5 3xl:pt-6 4xl:pt-7 pb-4 3xl:pb-5 4xl:pb-6 font-medium text-teal-900 bg-[#F2FBF9] rounded-xl border-teal-900 border-solid border-[0.25px] w-full h-[300px] 3xl:h-[350px] 4xl:h-[400px]">
      {renderContent()}
    </section>
  );
};

export default PortfolioPerformance;
