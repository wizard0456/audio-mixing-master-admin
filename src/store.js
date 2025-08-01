import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authSlice";

const store = configureStore({
    reducer: {
        user: authReducer,
    }
})

export default store;