import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PieChart as PieChartIcon,
  Activity,
  Plus
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { AddTransactionModal } from "./AddTransactionModal";
// import { Trade, Holding } from "../types";
export interface Holding {
  symbol: string;
  name: string;
  amount: number;
  value: number;
  cost: number;
  change: number;
  allocation: number;
}

export interface Trade {
  date: string;
  type: 'buy' | 'sell' | 'deposit';
  asset: string;
  amount: number;
  price: number;
  total: number;
  status: string;
}

// Initial Mock Data
const INITIAL_ALLOCATION = [
  { name: "Crypto", value: 45, color: "#14b8a6" },
  { name: "Stocks", value: 30, color: "#3b82f6" },
  { name: "Forex", value: 15, color: "#8b5cf6" },
  { name: "Cash", value: 10, color: "#64748b" },
];

const INITIAL_HOLDINGS: Holding[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    amount: 2.5,
    value: 118750,
    cost: 95000,
    change: 25.0,
    allocation: 28,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    amount: 50,
    value: 162000,
    cost: 145000,
    change: 11.7,
    allocation: 38,
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    amount: 100,
    value: 17850,
    cost: 18500,
    change: -3.5,
    allocation: 14,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    amount: 50,
    value: 12140,
    cost: 11000,
    change: 10.4,
    allocation: 10,
  },
  {
    symbol: "EUR/USD",
    name: "Euro",
    amount: 10000,
    value: 10845,
    cost: 11200,
    change: -3.2,
    allocation: 10,
  },
];

const INITIAL_HISTORY: Trade[] = [
  {
    date: "2025-11-22",
    type: "buy",
    asset: "BTC",
    amount: 0.5,
    price: 47500,
    total: 23750,
    status: "completed",
  },
  {
    date: "2025-11-21",
    type: "sell",
    asset: "ETH",
    amount: 2.0,
    price: 3240,
    total: 6480,
    status: "completed",
  },
  {
    date: "2025-11-20",
    type: "buy",
    asset: "AAPL",
    amount: 50,
    price: 178.5,
    total: 8925,
    status: "completed",
  },
  {
    date: "2025-11-19",
    type: "buy",
    asset: "TSLA",
    amount: 25,
    price: 242.8,
    total: 6070,
    status: "completed",
  },
];

const PERFORMANCE_DATA = [
  { date: "Nov 1", value: 95000 },
  { date: "Nov 5", value: 98500 },
  { date: "Nov 10", value: 102000 },
  { date: "Nov 15", value: 108500 },
  { date: "Nov 20", value: 118000 },
  { date: "Nov 22", value: 124580 },
];

export function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>(INITIAL_HOLDINGS);
  const [tradeHistory, setTradeHistory] = useState<Trade[]>(INITIAL_HISTORY);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Derived state for totals
  const totalValue = useMemo(() => holdings.reduce((sum, h) => sum + h.value, 0), [holdings]);
  const totalCost = useMemo(() => holdings.reduce((sum, h) => sum + h.cost, 0), [holdings]);
  const totalGain = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  const handleAddTransaction = (data: Omit<Trade, 'status'>) => {
    // console.log(data);
    // 1. Add to History
    // const newTrade: Trade = {
    //   ...data,
    //   status: 'completed'
    // };
    // setTradeHistory(prev => [newTrade, ...prev]);

    // // 2. Update Holdings Logic (Simplified for demo)
    // if (data.type === 'deposit') {
    //   // Just visually showing the interaction; usually would add to a 'Cash' holding
    //   // Check if Cash holding exists
    //   setHoldings(prev => {
    //     const cashIndex = prev.findIndex(h => h.symbol === 'USD');
    //     if (cashIndex >= 0) {
    //       const updated = [...prev];
    //       updated[cashIndex] = {
    //         ...updated[cashIndex],
    //         amount: updated[cashIndex].amount + data.amount,
    //         value: updated[cashIndex].value + data.amount,
    //         cost: updated[cashIndex].cost + data.amount, // Deposits increase cost basis 1:1
    //       };
    //       return updated;
    //     } else {
    //        return [...prev, {
    //         symbol: 'USD',
    //         name: 'US Dollar',
    //         amount: data.amount,
    //         value: data.amount,
    //         cost: data.amount,
    //         change: 0,
    //         allocation: 0 // Will recalculate
    //       }];
    //     }
    //   });
    // } else {
    //   setHoldings(prev => {
    //     const existingIndex = prev.findIndex(h => h.symbol === data.asset);
    //     let newHoldings = [...prev];

    //     if (existingIndex >= 0) {
    //       const current = newHoldings[existingIndex];
    //       if (data.type === 'buy') {
    //         console.log(data)
    //         const newAmount = current.amount + data.amount;
    //         const newCost = current.cost + (data.amount * data.price);
    //         // Assume current value updates to latest price for the whole holding for simplicity, 
    //         // or just add the value of new purchase. Let's do a blended update.
    //         // In a real app, you'd fetch live price. Here we assume the trade price is current price.
    //         const newValue = newAmount * data.price; 
            
    //         newHoldings[existingIndex] = {
    //           ...current,
    //           amount: newAmount,
    //           cost: newCost,
    //           value: newValue,
    //           change: ((newValue - newCost) / newCost) * 100
    //         };
    //       } else if (data.type === 'sell') {

    //         console.log(data)

    //         const newAmount = Math.max(0, current.amount - data.amount);
    //         // Sell doesn't change cost basis per share, but reduces total cost basis proportionally
    //         const costPerShare = current.cost / current.amount;
    //         const newCost = newAmount * costPerShare;
    //         const newValue = newAmount * data.price;
            
    //         newHoldings[existingIndex] = {
    //           ...current,
    //           amount: newAmount,
    //           cost: newCost,
    //           value: newValue,
    //           change: newCost > 0 ? ((newValue - newCost) / newCost) * 100 : 0
    //         };
    //       }
    //     } else if (data.type === 'buy') {
    //       console.log(data);
    //       // New Holding
    //       // newHoldings.push({
    //       //   symbol: data.asset,
    //       //   name: data.asset, // Simple name mapping
    //       //   amount: data.amount,
    //       //   value: data.amount * data.price,
    //       //   cost: data.amount * data.price,
    //       //   change: 0,
    //       //   allocation: 0
    //       // });
    //     }
        
    //     // Recalculate Allocations
    //     const newTotal = newHoldings.reduce((sum, h) => sum + h.value, 0);
    //     return newHoldings.map(h => ({
    //       ...h,
    //       allocation: newTotal > 0 ? parseFloat(((h.value / newTotal) * 100).toFixed(1)) : 0
    //     }));
    //   });
    // }
  };

  return (
    <div className="space-y-6">
      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTransaction}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            Portfolio <span className="text-sm font-normal px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">PRO</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Track your investments and performance across all markets
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:shadow-xl hover:shadow-slate-500/20 dark:hover:shadow-white/10 transition-all active:scale-95 font-medium"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Add Balance
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-teal-500 to-blue-600 text-white shadow-xl shadow-blue-500/20">
          <div className="relative z-10">
            <p className="text-blue-100 font-medium mb-1">Total Portfolio Value</p>
            <p className="text-4xl font-bold mb-4 tracking-tight">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <div className="flex items-center gap-2 bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span className="font-medium">+${totalGain.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({totalGainPercent.toFixed(1)}%)</span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/30 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none"></div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-green-500/10 text-green-500">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">All Time</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Gain/Loss</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            +${totalGain.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">24H</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Today's Change</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">+$2,847.20</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
              <PieChartIcon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Diversity</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Active Assets</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{holdings.length}</p>
        </div>
      </div>

      {/* Allocation and Performance */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Asset Allocation */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Asset Allocation
          </h3>

          <div className="flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={INITIAL_ALLOCATION}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  cornerRadius={6}
                  stroke="none"
                >
                  {INITIAL_ALLOCATION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
             {/* Center Text */}
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">100%</span>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Invested</span>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            {INITIAL_ALLOCATION.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div
                  className="w-3 h-3 rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800"
                  style={{ backgroundColor: item.color, "--tw-ring-color": item.color } as React.CSSProperties}
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.value}% Portfolio
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Chart */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Performance
            </h3>
            <select className="bg-slate-100 dark:bg-slate-700 border-none text-xs rounded-lg px-3 py-1.5 text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500">
              <option>30 Days</option>
              <option>90 Days</option>
              <option>1 Year</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={PERFORMANCE_DATA}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dx={-10}
                tickFormatter={(value) => `$${value/1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "none",
                  borderRadius: "12px",
                  color: "#fff",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
                itemStyle={{ color: "#fff" }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Value"]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#14b8a6"
                strokeWidth={3}
                dot={{ fill: "#14b8a6", r: 4, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 px-2">
          Holdings
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider rounded-l-xl">Asset</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Cost</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Change</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider rounded-r-xl">Alloc</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {holdings.map((holding, i) => (
                <tr
                  key={i}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                        {holding.symbol.substring(0, 1)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {holding.symbol}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {holding.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-700 dark:text-slate-300">
                    {holding.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-white">
                    ${holding.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500 dark:text-slate-400 text-sm">
                    ${holding.cost > 0 ? (holding.cost / holding.amount).toLocaleString(undefined, { maximumFractionDigits: 2 }) : 0}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        holding.change > 0 
                          ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                          : holding.change < 0 
                            ? "bg-red-500/10 text-red-600 dark:text-red-400"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {holding.change > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : holding.change < 0 ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : null}
                      <span>
                        {holding.change > 0 ? "+" : ""}
                        {holding.change.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"
                          style={{ width: `${holding.allocation}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-8">
                        {holding.allocation}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trade History */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 px-2">
          Trade History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider rounded-l-xl">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {tradeHistory.map((trade, i) => (
                <tr
                  key={i}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                    {trade.date}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        trade.type === "buy"
                          ? "bg-green-500/5 border-green-500/20 text-green-600 dark:text-green-400"
                          : trade.type === "sell"
                            ? "bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400"
                            : "bg-blue-500/5 border-blue-500/20 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {trade.type === "buy" ? (
                        <ArrowDownRight className="w-3 h-3" />
                      ) : trade.type === "sell" ? (
                         <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <Wallet className="w-3 h-3" />
                      )}
                      {trade.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                    {trade.asset}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-700 dark:text-slate-300 font-medium">
                    {trade.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-600 dark:text-slate-400">
                    ${trade.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-slate-900 dark:text-white">
                    ${trade.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      {trade.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}