import React, { useState, useEffect, useRef, useCallback } from "react";
import { TrendingUp, Info, Pencil, Minus, Clock, Zap } from "lucide-react";
import { TradingViewChart } from "./TradingViewChart";
import { api_init } from "./api/auth";
import { useTread } from "../store/teadDataStore.js";
import { toast } from "sonner";

declare const LightweightCharts: {
  createChart: (container: HTMLElement, options: any) => any;
  ColorType: { Solid: "solid" };
};

// --- Type Definitions ---
export interface CandleData {
  time: string; // "YYYY-MM-DD HH:MM:SS"
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TradeLogEntry {
  id?: number;
  type?: "buy" | "sell";
  price?: number;
  amount?: number;
  time?: string;
  symbol?: string;
  current_price?: number;
  message?: string;
  // Added to clarify order type (Execution, TP, SL)
}


// Available trading pairs
const AVAILABLE_PAIRS = [
  { symbol: "BTCUSDT", label: "BTC/USDT" },
  { symbol: "ETHUSDT", label: "ETH/USDT" },
  { symbol: "SOLUSDT", label: "SOL/USDT" },
  { symbol: "BNBUSDT", label: "BNB/USDT" },
  { symbol: "ADAUSDT", label: "ADA/USDT" },
  { symbol: "XRPUSDT", label: "XRP/USDT" },
];

// -------------------------------
// UTILITIES FOR LIGHTWEIGHT CHARTS
// -------------------------------

// Helper to convert time string to a timestamp (seconds) suitable for Lightweight Charts
function toTimestamp(str: string): number {
  const date = new Date(str.replace(" ", "T"));
  return Math.floor(date.getTime() / 1000);
}

// -------------------------------
// LIGHTWEIGHT CHART COMPONENT
// -------------------------------

interface ChartProps {
  data: CandleData[];
  height?: number;
}

function generateDummyCandles(
  symbol: string,
  curentData: Record<string, number> | null = null,
  count: number = 100
): CandleData[] {
  const now = new Date();
  const candles: CandleData[] = [];

  const startTime = new Date(now.getTime() - count * 60 * 1000);

  const basePrices: Record<string, number> = curentData || {
    BTCUSDT: 92000,
    ETHUSDT: 2802.31,
    SOLUSDT: 2802.31,
    BNBUSDT: 829.45,
    ADAUSDT: 0.39,
    XRPUSDT: 0.58,
  };

  let currentPrice = basePrices[symbol] || 45000;

  for (let i = 0; i < count; i++) {
    const candleTime = new Date(startTime.getTime() + i * 60 * 1000);

    const variance = 0.002;
    const pct = (Math.random() - 0.5) * variance;
    const open = currentPrice;
    const close = open * (1 + pct);

    const baseHigh = Math.max(open, close);
    const baseLow = Math.min(open, close);

    const wick = baseHigh * 0.0005;
    const high = baseHigh + Math.random() * wick;
    const low = baseLow - Math.random() * wick;

    const volume = Math.floor(5000 + Math.random() * 5000);

    candles.push({
      time: candleTime.toISOString().split(".")[0].replace("T", " "),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });

    currentPrice = close;
  }

  return candles;
}

// -------------------------------
// TICK MAPPING & HELPERS
// -------------------------------
function mapTick(tickerData: any) {
  return {
    price: parseFloat(tickerData.c ?? tickerData.p ?? 0),
    volume: parseFloat(tickerData.v ?? 0),
    ts: tickerData.E ?? Date.now(),
    symbol: tickerData.s,
  };
}

function buildMinute(ts: number) {
  const t = new Date(ts);
  t.setSeconds(0, 0); // Important: snap to the minute
  return t;
}

// -------------------------------
// TRADE LOG COMPONENT
// -------------------------------

interface TradeLogProps {
  activity: TradeLogEntry[];
  selectedPair: string;
}

function TradeLog({ activity, selectedPair }: TradeLogProps) {
  const assetSymbol = selectedPair.replace("USDT", "");
  const [trades, setTrades] = useState(activity); // manage local state
  const { remove_Tread_Data } = useTread();
  // onCancel function to delete a trade
  const onCancel = (tradeId: number) => {
    // setTrades((prevTrades) => prevTrades.filter((t) => t.id !== tradeId));
    remove_Tread_Data(tradeId);
  };

  // Reverse the array to show most recent trades first
  // const recentTrades = activity.slice().reverse();
  const cancel_tread = async (id: number) => {
    try {
      const responce = await api_init.post("/api/cancel_tread", { id: id });
      if (responce.data.success) {
        onCancel(id);
        toast(`cancel tread ${id}`, {
          description: responce.data.success,
        });
      }
    } catch (error: any) {
      console.log(error.message);
      toast(`${error.message || "failed cancel operation"}`);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2 pb-2 border-b border-gray-700">
        <Clock className="w-5 h-5 text-blue-400" />
        Recent Activity
      </h2>

      <div className="space-y-3 max-h-[700px] overflow-y-auto">
        {activity.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            No active trades
          </p>
        )}

        {activity.map((t) => (
          <div
            key={t.id}
            className="p-4 rounded-lg border border-gray-700 bg-gray-800 text-white shadow-sm"
          >
            <p>
              <span className="font-semibold text-gray-300">Symbol:</span>{" "}
              <span className="text-white">{t.symbol}</span>
            </p>
            <p>
              <span className="font-semibold text-gray-300">Price:</span>{" "}
              <span className="text-green-400">{t.current_price}</span>
            </p>
            <p>
              <span className="font-semibold text-gray-300">Trade ID:</span>{" "}
              <span className="text-gray-200">{t.id}</span>
            </p>

            {t.message && (
              <p>
                <span className="font-semibold text-gray-300">Status:</span>{" "}
                <span className="text-yellow-400">{t.message}</span>
              </p>
            )}

            {/* Cancel button */}
            <button
              onClick={() => cancel_tread(t.id!)}
              className="mt-2 px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded text-white self-start"
            >
              Cancel
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TradeData {
  id: number; // trade ID from backend
  symbol: string;
  current_price: number;
  message: string; // "trade hold", "trade close", etc.
  user_id: string;
  updatedAt: number; // timestamp for auto-delete
}
// -------------------------------
// MAIN APPLICATION COMPONENT
// -------------------------------
function TradePage() {
  const candleObject = useRef<Record<string, number>>({});

  // --- Initialization using a single source of truth ---
  const INITIAL_PAIR = "BTCUSDT";

  const initialData = generateDummyCandles(INITIAL_PAIR);

  // --- STATE ---
  const [selectedPair, setSelectedPair] = useState<string>(INITIAL_PAIR);
  const [candles, setCandles] = useState<CandleData[]>(initialData);

  const [currentTickerPrice, setCurrentTickerPrice] = useState<number>(
    initialData.length > 0 ? initialData[initialData.length - 1].close : 0
  );
  // Trade History
  const [tradeHistory, setTradeHistory] = useState<TradeLogEntry[]>([]);
  const tradeIdRef = useRef(0);

  // --- REFS ---
  const wsRef = useRef<WebSocket | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const selectedPairRef = useRef(selectedPair);
  const currentCandleRef = useRef<any>(null); // { minute: ms, time: string, ... }
  // Initialize history ref with the initial data
  const historyRef = useRef<CandleData[]>([...initialData]);

  // --- ORDER FORM STATE (Only 'market' and 'bracket' remain) ---
  const [orderType, setOrderType] = useState<"market" | "bracket">("market");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState(0.5);
  // 'price' state is now technically redundant as execution is always at current market price, but we keep it
  // for TP/SL initialization logic consistency.
  const [price, setPrice] = useState(currentTickerPrice || 47500);
  const [timeframe, setTimeframe] = useState("1m");

  // STATES for Bracket Order
  const [takeProfitPrice, setTakeProfitPrice] = useState(0);
  const [stopLossPrice, setStopLossPrice] = useState(0);

  // Calculate effective price: Market/Bracket ALWAYS use current price
  const effectivePrice = currentTickerPrice;
  const totalValue = amount * (effectivePrice || 0);

  const { upsert_Tread_Data, tread_Data } = useTread();

  // const [activity, setActivity] = useState<TradeData[]>([]);
  // Update TP/SL price state when the current market price changes or order type/trade type switches
  useEffect(() => {
    if (currentTickerPrice > 0 && orderType === "bracket") {
      // Example: TP/SL 0.5% away (A reasonable starting point for BTC/ETH)
      const deviation = currentTickerPrice * 0.005;

      let newTP: number, newSL: number;

      if (tradeType === "buy") {
        newTP = currentTickerPrice + deviation;
        newSL = currentTickerPrice - deviation;
      } else {
        // sell (short)
        newTP = currentTickerPrice - deviation;
        newSL = currentTickerPrice + deviation;
      }

      // Only update if the current values are close to 0 or far from the calculated deviation,
      // preventing resets when users are actively setting them.
      const isTPDefault =
        takeProfitPrice === 0 || Math.abs(takeProfitPrice - newTP) < 10;
      const isSLDefault =
        stopLossPrice === 0 || Math.abs(stopLossPrice - newSL) < 10;

      if (isTPDefault) setTakeProfitPrice(newTP);
      if (isSLDefault) setStopLossPrice(newSL);
    }
  }, [
    currentTickerPrice,
    orderType,
    tradeType,
    takeProfitPrice,
    stopLossPrice,
  ]);

  // Handler to log a trade
  const handleTrade = useCallback(async () => {
    // Basic validation
    if (amount <= 0 || effectivePrice <= 0) {
      console.error("Invalid trade amount or price.");
      return;
    }

    switch (orderType) {
      case "bracket":
 

        try {
          const responce = await api_init.post("/api/stop-loss-take-profit", {
            // @ts-ignore
            symbol: assetSymbol,
            quantity: amount,
            type: tradeType == "buy" ? "long" : "short",
            take_profit: takeProfitPrice,
            stop_loss: stopLossPrice,
          });

          if (responce.data.success) {
            toast(`success fully ${tradeType}`, {
              description: responce.data.success,
            });
          }
        } catch (error: any) {
          toast(`${error.messages || "failed"}`);
        }

        break;
      case "market":
        if (tradeType == "buy") {
          try {
            const responce = await api_init.post(
              "/api/purchase-new-simple-trade",
              {
                // @ts-ignore
                symbol: assetSymbol,
                quantity: amount,
              }
            );

            if (responce.data.success) {
              toast(`success fully ${tradeType}`, {
                description: responce.data.success,
              });
            }
          } catch (error: any) {
            toast(`${error.messages || "failed"}`);
          }
        } else if (tradeType == "sell") {
          try {
            const responce = await api_init.post(
              "/api/sell-existing-simple-trade",
              {
                // @ts-ignore symbol, quantity
                symbol: assetSymbol,
                quantity: amount,
              }
            );
            if (responce.data.success) {
              toast(`success fully ${tradeType}`, {
                description: responce.data.success,
              });
            }
          } catch (error: any) {
            toast(`${error.messages || "failed"}`);
          }
        }

        break;
      default:
        break;
    }
  }, [
    amount,
    effectivePrice,
    tradeType,
    selectedPair,
    orderType,
    takeProfitPrice,
    stopLossPrice,
  ]);

  // ----------------------------------------------------
  // HANDLE PAIR CHANGE (RESET WITH FRESH DUMMY DATA)
  // ----------------------------------------------------
  useEffect(() => {
    selectedPairRef.current = selectedPair;

    const freshDummyData = generateDummyCandles(
      selectedPair,
      candleObject?.current
    );

    // CRITICAL FIX: Reset all data related state and refs simultaneously
    setCandles(freshDummyData);
    historyRef.current = [...freshDummyData]; // Update the mutable ref
    currentCandleRef.current = null; // Clear the current candle

    const newPrice =
      freshDummyData.length > 0
        ? freshDummyData[freshDummyData.length - 1].close
        : 0;
    setCurrentTickerPrice(newPrice);
    // Reset the price state (used for TP/SL initialization)
    setPrice(newPrice);
  }, [selectedPair]);

  // PROCESS TICK -> build/append 1-minute candle
  function processTick(tick: { price: number; volume: number; ts: number }) {
    const minute = buildMinute(tick.ts);
    const minuteKey = minute.getTime();

    let candle = currentCandleRef.current;

    // NEW CANDLE STARTING
    if (!candle || candle.minute !== minuteKey) {
      // finalize previous candle (if exists)
      if (candle) {
        // push finalized candle (strip minute field, rely on fixed numbers)
        const finalized: CandleData = {
          time: new Date(candle.minute)
            .toISOString()
            .split(".")[0]
            .replace("T", " "),
          open: Number(candle.open),
          high: Number(candle.high),
          low: Number(candle.low),
          close: Number(candle.close),
          volume: Math.floor(candle.volume),
        };

        historyRef.current.push(finalized);

        // cap history
        if (historyRef.current.length > 500) {
          historyRef.current = historyRef.current.slice(-500);
        }
      }

      // start new current candle
      currentCandleRef.current = {
        minute: minuteKey,
        time: minute.toISOString().split(".")[0].replace("T", " "),
        open: tick.price,
        high: tick.price,
        low: tick.price,
        close: tick.price,
        volume: tick.volume,
      };
    } else {
      // UPDATE EXISTING CURRENT CANDLE
      candle.high = Math.max(candle.high, tick.price);
      candle.low = Math.min(candle.low, tick.price);
      candle.close = tick.price;
      candle.volume += tick.volume;
    }

    // SIMPLIFIED STATE UPDATE: Set state with history + current candle.
    setCandles([...historyRef.current, { ...currentCandleRef.current }]);
  }

  // WEBSOCKET (Kept for structure, relies on external service)
  useEffect(() => {
    const ws = new WebSocket(`${import.meta.env.VITE_API_URI_PUBLISH}`);
    const socket = new WebSocket(`${import.meta.env.VITE_API_URL}`);
    wsRef.current = ws;
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("socket connect");
      const email = localStorage.getItem("email");
      if (email == null) return;
      socket.send(
        JSON.stringify({
          type: "join",
          payload: {
            email: email,
          },
        })
      );
    };

    ws.onopen = () => {
      console.log("WS Connected");
      ws.send(JSON.stringify({ type: "join" }));
    };

    ws.onmessage = (msg) => {
      try {
        const parsedMsg = JSON.parse(msg.data);

        // When server confirms subscription
        if (parsedMsg.type === "join_successfully") {
          const obj: Record<string, number> = {};

          // Extract price data safely
          for (const [key, value] of Object.entries(parsedMsg.payload.data)) {
            const v = value as { price?: number };
            obj[key] = typeof v.price === "number" ? v.price : 0;
          }

          // Update selected pair ref
          selectedPairRef.current = selectedPair;

          // Generate fresh candle set using prices from WebSocket
          const freshDummyData = generateDummyCandles(selectedPair, obj);
          candleObject.current = obj;

          // Update chart state & refs
          setCandles(freshDummyData);
          historyRef.current = [...freshDummyData];
          currentCandleRef.current = null;

          // Update current price
          const last = freshDummyData[freshDummyData.length - 1];
          setCurrentTickerPrice(last.close);
          setPrice(last.close);

          return; // stop here (first message processed)
        }

        // All other messages = live ticks
        if (!parsedMsg.data || !parsedMsg.data.s) return;
        if (parsedMsg.data.s !== selectedPairRef.current) return;

        const tick = mapTick(parsedMsg.data);
        if (!tick.price) return;

        setCurrentTickerPrice(tick.price);
        processTick(tick);
      } catch (err) {
        console.error("WS Error parsing:", err);
      }
    };

    socket.onmessage = (msg) => {
      try {
        const parsedMsg = JSON.parse(msg.data);
        if (parsedMsg.type !== "tread_status") return;

        const trade = parsedMsg.data;
        if (!trade?.id) return;
        upsert_Tread_Data(trade);

       
      } catch (error: any) {
        console.error(" socket Error parsing:", error);
      }
    };

    ws.onerror = (err) => console.error("WS Error:", err);
    ws.onclose = () => console.log("WS closed");

    return () => {
      try {
        if (ws && ws.readyState === WebSocket.OPEN) ws.close();
      } catch {}
    };
  }, []);

  const selectedPairLabel =
    AVAILABLE_PAIRS.find((p) => p.symbol === selectedPair)?.label ||
    selectedPair;

  const assetSymbol = selectedPair;

  return (
    // We add the CDN script tag here to load lightweight-charts globally
    // for the TradingViewChart component to use.
    <>
      <script
        src="https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js"
        type="text/javascript"
      ></script>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 font-sans">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Trade Execution
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Execute trades using Market or Bracket orders
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Chart Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {/* Header with Select and Price */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <select
                      value={selectedPair}
                      onChange={(e) => setSelectedPair(e.target.value)}
                      className="text-2xl  font-bold bg-transparent text-slate-900 dark:text-white mb-1 border-none focus:ring-0 cursor-pointer outline-none p-0"
                    >
                      {AVAILABLE_PAIRS.map((pair) => (
                        <option
                          className=" dark:bg-slate-800 "
                          key={pair.symbol}
                          value={pair.symbol}
                        >
                          {pair.label}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-4">
                      <span className="text-3xl text-slate-900 dark:text-white min-h-[40px]">
                        {currentTickerPrice > 0
                          ? `$${currentTickerPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                          : "Loading..."}
                      </span>
                      <span className="flex items-center gap-1 text-green-500">
                        <TrendingUp className="w-5 h-5" />
                        +7.0%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm">Live</span>
                    </div>
                  </div>
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400">
                      <TrendingUp className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400">
                      <Minus className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400">
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900">
                    {["1m", "5m", "15m", "1h", "4h", "1D", "1W"].map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-3 py-1.5 rounded-lg text-sm ${
                          timeframe === tf
                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>

                  <div>
                    <select className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border-none text-sm text-slate-600 dark:text-slate-400 outline-none">
                      <option>Candles</option>
                      <option>Line</option>
                    </select>
                  </div>
                </div>

                {/* Chart */}
                <div className="min-h-[500px] flex items-center justify-center rounded-xl overflow-hidden">
                  <TradingViewChart data={candles} />
                </div>
              </div>

              {/* Order Form Section */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {/* Buy / Sell Toggle */}
                <div className="flex gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 mb-6">
                  <button
                    onClick={() => setTradeType("buy")}
                    className={`flex-1 py-3 rounded-lg transition-colors ${
                      tradeType === "buy"
                        ? "bg-green-500 text-white"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setTradeType("sell")}
                    className={`flex-1 py-3 rounded-lg transition-colors ${
                      tradeType === "sell"
                        ? "bg-red-500 text-white"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    Sell
                  </button>
                </div>

                {/* Order Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Order Type
                  </label>
                  <div className="flex gap-2">
                    {/* Only Market and Bracket are available now */}
                    {["market", "bracket"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setOrderType(type as any)}
                        // Harmonized accent color for selected order type
                        className={`flex-1 px-4 py-3 rounded-xl capitalize transition-all ${
                          orderType === type
                            ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md shadow-blue-500/30"
                            : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {type.replace("-", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Input */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm text-slate-600 dark:text-slate-400">
                      Amount ({assetSymbol})
                    </label>
                    <span className="text-sm text-slate-500">
                      Available: 2.5
                    </span>
                  </div>

                  <input
                    type="number"
                    placeholder={`${amount}`}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    // Input focus ring uses blue accent
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                  <input
                    type="range"
                    min={0}
                    max={2.5}
                    step={0.01}
                    value={amount || 0}
                    onChange={(e) => setAmount(parseFloat(e.target.value))}
                    className="w-full mt-3 accent-blue-500"
                  />
                </div>

                {/* BRACKET ORDER INPUTS - Only visible when orderType is 'bracket' */}
                {orderType === "bracket" && (
                  <>
                    {/* Take Profit Price */}
                    <div className="mb-4">
                      <label className="block text-sm text-slate-600 dark:text-slate-400 mb-3">
                        Take Profit Price (
                        {tradeType === "buy" ? "Sell Limit" : "Buy Limit"})
                        (USDT)
                      </label>
                      <input
                        type="number"
                        // value="00"
                        placeholder="enter amount"
                        onChange={(e) =>
                          setTakeProfitPrice(parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                      />
                    </div>

                    {/* Stop Loss Price */}
                    <div className="mb-6">
                      <label className="block text-sm text-slate-600 dark:text-slate-400 mb-3">
                        Stop Loss Price (
                        {tradeType === "buy" ? "Sell Stop" : "Buy Stop"}) (USD)
                      </label>
                      <input
                        type="number"
                        // value=\
                        placeholder="enter amount"
                        onChange={(e) =>
                          setStopLossPrice(parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                      />
                    </div>
                  </>
                )}

                {/* Order Summary */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 mb-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500">Order Type</span>
                    <span className="text-slate-900 dark:text-white capitalize">
                      {orderType.replace("-", " ")}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500">Amount</span>
                    <span className="text-slate-900 dark:text-white">
                      {amount.toFixed(4)} {assetSymbol}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Execution Price</span>
                    <span className="text-slate-900 dark:text-white">
                      $
                      {effectivePrice.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      {/* Execution is always at market price */}
                      {" (Market)"}
                    </span>
                  </div>

                  {orderType === "bracket" && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 mt-2 text-xs">
                      <div className="flex justify-between text-green-500">
                        <span>Take Profit (Limit)</span>
                        <span>
                          $
                          {takeProfitPrice.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between text-red-500">
                        <span>Stop Loss (Stop)</span>
                        <span>
                          $
                          {stopLossPrice.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Total Estimation</span>
                      <span className="text-xl font-bold text-slate-900 dark:text-white">
                        $
                        {totalValue.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Button - Calls handleTrade */}
                <button
                  onClick={handleTrade}
                  className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all transform active:scale-[0.98] ${
                    tradeType === "buy"
                      ? "bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 shadow-lg shadow-blue-500/30" // Harmonized gradient
                      : "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30"
                  }`}
                >
                  {tradeType === "buy" ? "Buy" : "Sell"} {selectedPairLabel}
                </button>

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500">
                  <Info className="w-4 h-4" />
                  <span>
                    {orderType === "bracket"
                      ? "Bracket order places one market execution, one limit (TP), and one stop (SL) order."
                      : "Simple market order executes instantly at the current price."}
                  </span>
                </div>
              </div>
            </div>

            {/* Side Panel (Right Sidebar) */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-full">
                {/* Pass tradeHistory to TradeLog */}
                <TradeLog activity={tread_Data} selectedPair={selectedPair} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Make the main component the default export
export default TradePage;
