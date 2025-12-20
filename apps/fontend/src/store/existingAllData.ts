// import { create } from "zustand";

// export interface TradeStatusData {
//   price: number;
//   quantity: number;
//   symbol: string;
//   tread_type: string;
// }

// interface Use_Tread_Store_Data {
//   old_Data: TradeStatusData[];
//   add_Tread_Data: (oldTread: TradeStatusData[]) => void;
//   remove_Tread_Data: (symbol: string) => void;
// }

// const STORAGE_KEY = "old_tread_data";

// export const useOldTread = create<Use_Tread_Store_Data>((set) => ({
 
//   old_Data: JSON.parse(
//     sessionStorage.getItem(STORAGE_KEY) || "[]"
//   ),

  
//   add_Tread_Data: (oldTread) => {
//     sessionStorage.setItem(
//       STORAGE_KEY,
//       JSON.stringify(oldTread)
//     );

//     set(() => ({
//       old_Data: oldTread,
//     }));
//   },

 
//   remove_Tread_Data: (symbol) =>
//     set((state) => {
//       const updatedData = state.old_Data.filter(
//         (trade) => trade.symbol !== symbol
//       );

      
//       if (updatedData.length === 0) {
//         sessionStorage.removeItem(STORAGE_KEY);
//       } else {
//         sessionStorage.setItem(
//           STORAGE_KEY,
//           JSON.stringify(updatedData)
//         );
//       }

//       return { old_Data: updatedData };
//     }),
// }));
