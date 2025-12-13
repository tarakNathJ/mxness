import React, { useState, useEffect } from "react";
import { X, Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { api_init } from "./api/auth";
import { toast } from "sonner";

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
  type: "buy" | "sell" | "deposit";
  asset: string;
  amount: number;
  price: number;
  total: number;
  status: string;
}

export interface Allocation {
  name: string;
  value: number;
  color: string;
}

export interface ChartData {
  date: string;
  value: number;
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Trade, "status">) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [type, setType] = useState<"buy" | "sell" | "deposit">("deposit");
  const [asset, setAsset] = useState("");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setType("deposit");
      setAsset("");
      setAmount("");
      setPrice("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // console.log(amount, "  :  ", asset, "   : ", type);

    // const responce = await api_init.post("/api/add-balance", {
    //   symbol: "USD",
    //   balance: amount,
    // });
    // console.log(responce);
    switch (type) {
      case "deposit":
        try {
          const responce = await api_init.post("/api/add-balance", {
            symbol: "USD",
            balance: amount,
          });

          if (responce.data.success) {
            toast("success add balance", {
              description: amount,
            });
          }
        } catch (error: any) {
          toast("add balance failed", {
            description: error.message || "samthing is wrong",
          });
        }
        break;
      case "buy":
        try {
          const responce_for_buy = await api_init.post(
            "/api/purchase-new-simple-trade",
            {
              symbol: asset,
              quantity: amount,
            }
          );

          if (responce_for_buy.data.success) {
            toast(" trade success fully  purchase ", {
              description: responce_for_buy.data.success,
            });
          }
        } catch (error: any) {
          toast("purchase stock failed ", {
            description: error.message || "samthing is wrong",
          });
        }

      case "sell":
        try {
          const responce_for_sell = await api_init.post(
            "/api/sell-existing-simple-trade",
            {
              symbol: asset,
              quantity: amount,
            }
          );
          if (responce_for_sell.data.success) {
            toast(" trade success fully  purchase ", {
              description: responce_for_sell.data.success,
            });
          }
        } catch (error: any) {
          toast("sell stock failed");
        }

      default:
        break;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 transform transition-all scale-100 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Add Transaction
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Update your portfolio balance
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Transaction Type Selector */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setType("deposit")}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                type === "deposit"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"
              }`}
            >
              <Wallet className="w-6 h-6 mb-2" />
              <span className="text-xs font-medium">Deposit</span>
            </button>
            <button
              type="button"
              onClick={() => setType("buy")}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                type === "buy"
                  ? "border-green-500 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 ring-1 ring-green-500"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"
              }`}
            >
              <TrendingUp className="w-6 h-6 mb-2" />
              <span className="text-xs font-medium">Buy</span>
            </button>
            <button
              type="button"
              onClick={() => setType("sell")}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                type === "sell"
                  ? "border-red-500 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-500"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"
              }`}
            >
              <TrendingDown className="w-6 h-6 mb-2" />
              <span className="text-xs font-medium">Sell</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Asset Symbol Input (Hidden for Deposit) */}
            {type !== "deposit" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Asset Symbol
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={asset}
                    onChange={(e) => setAsset(e.target.value)}
                    placeholder="e.g. BTC, AAPL"
                    className="w-full pl-4 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all dark:text-white uppercase placeholder:normal-case"
                  />
                </div>
              </div>
            )}

            {/* Amount/Price Grid */}
            <div
              className={`grid ${type === "deposit" ? "grid-cols-1" : "grid-cols-2"} gap-4`}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {type === "deposit" ? "Amount (USD)" : "Quantity"}
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all dark:text-white"
                />
              </div>

              {false && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Price per Unit
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      $
                    </span>
                    <input
                      type="number"
                      step="any"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Total Preview */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Total Value
              </span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                $
                {type === "deposit" ? Number(amount || 0).toLocaleString() : ""}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-teal-500/25 transition-all active:scale-[0.98]"
            >
              {type === "deposit"
                ? "Add Funds"
                : type === "buy"
                  ? "Confirm Buy"
                  : "Confirm Sell"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/*

   // Basic validation
    // if (!amount || Number(amount) <= 0) return;
    // if (type !== 'deposit' && (!asset || !price)) return;

    // const transactionData: Omit<Trade, 'status'> = {
    //   date: new Date().toISOString().split('T')[0],
    //   type,
    //   asset: type === 'deposit' ? 'USD' : asset.toUpperCase(),
    //   amount: Number(amount),
    //   price: type === 'deposit' ? 1 : Number(price),
    //   total: type === 'deposit' ? Number(amount) : Number(amount) * Number(price),
    // };
*/
