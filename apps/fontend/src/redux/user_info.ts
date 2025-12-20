import { createSlice } from "@reduxjs/toolkit";
import { LoadState, StoreData, RemoveData } from "./session.js";

const key = "user_info";

const user_info = createSlice({
    name: "user_info",
    initialState: {
        data: LoadState(key, [])
    }, 
    reducers: {
        add_data: (state, action) => {
            state.data = action.payload;
            StoreData(key, state.data);
        },

        remove_data: (state) => {
            state.data = [];
            RemoveData(key);
        }
    }
});

export const { add_data, remove_data } = user_info.actions;
export default user_info.reducer;
