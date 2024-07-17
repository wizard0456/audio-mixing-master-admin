import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "../reducers/customerSlice";

export const store = configureStore({
    reducer: {
        customer: customerReducer,
    }
})