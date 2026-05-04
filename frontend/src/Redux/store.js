import { configureStore } from "@reduxjs/toolkit";
import AuthReducer from "./Slices/AuthSlice";
import WalletReducer from "./Slices/WalletSlice";
import TicketsReducer from "./Slices/TicketsSlice";

const store = configureStore({
    reducer: {
        auth: AuthReducer,
        wallet: WalletReducer,
        tickets: TicketsReducer,
    }
})

export default store;
