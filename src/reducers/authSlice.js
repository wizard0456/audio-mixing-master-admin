// userSlice.js
import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState = {
    user: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        addUser(state, action) {
            state.user = action.payload;
            console.log("addUser", state.user);
            localStorage.setItem("user", JSON.stringify(action.payload));
            Cookies.set("user", JSON.stringify(action.payload));
        },
        logout(state) {
            localStorage.removeItem("user");
            Cookies.remove("user");
            state.user = null;
        },
    },
});

export const { addUser, logout } = userSlice.actions;
export const selectUser = (state) => state?.user?.user;
export default userSlice.reducer;