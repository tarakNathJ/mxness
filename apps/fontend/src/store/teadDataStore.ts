// import { create } from "zustand";

// interface TradeStatusData {
//   current_price: number;
//   id: number;
//   message: string;
//   symbol: string;
//   user_id: string;
// }

// interface Use_Tread_Store_Data {
//   tread_Data: TradeStatusData[];
//   add_Tread_Data: (newTradeData: TradeStatusData) => void;
//   remove_Tread_Data: (newTradeData: TradeStatusData) => void;
//   update_tread_Data: (newTradeData: TradeStatusData) => void;
// }

// export const useTread = create<Use_Tread_Store_Data>((set) => ({
//   tread_Data: [],

//    add_Tread_Data: (newTradeData) => set((state) => ({
//     tread_Data: [...state.tread_Data, newTradeData]
//    })),

//    remove_Tread_Data: (newTradeData) => set((state) => ({
//     tread_Data: [...state.tread_Data, newTradeData]
//    })),

//    update_tread_Data: (newTradeData) => set((state) => ({
//     tread_Data: [...state.tread_Data, newTradeData]
//    })),
// }));

import { create } from "zustand";

interface TradeStatusData {
  current_price: number;
  id: number;
  message: string;
  symbol: string;
  user_id: string;
}

interface Use_Tread_Store_Data {
  tread_Data: TradeStatusData[];
  upsert_Tread_Data: (trade: TradeStatusData) => void;
  remove_Tread_Data: (id: number) => void;
}

export const useTread = create<Use_Tread_Store_Data>((set) => ({
  tread_Data: [],

  
  upsert_Tread_Data: (trade) =>
    set((state) => {
      const exists = state.tread_Data.some(
        (t) => t.id === trade.id
      );

      return {
        tread_Data: exists
          ? state.tread_Data.map((t) =>
              t.id === trade.id ? { ...t, ...trade } : t
            )
          : [...state.tread_Data, trade],
      };
    }),

  
  remove_Tread_Data: (id) =>
    set((state) => ({
      tread_Data: state.tread_Data.filter(
        (trade) => trade.id !== id
      ),
    })),
}));
