import { configureStore } from "@reduxjs/toolkit";
import AuthReducer from "./Slices/AuthSlice";
import WalletReducer from "./Slices/WalletSlice";
import TicketsReducer from "./Slices/TicketsSlice";
import NotificationReducer from "./Slices/notificationSlice";
import SettingsReducer from "./Slices/settingsSlice";
import adminReducer from './Slices/adminSlice';

const store = configureStore({
    reducer: {
        auth: AuthReducer,
        wallet: WalletReducer,
        tickets: TicketsReducer,
        notifications: NotificationReducer,
        settings: SettingsReducer,
        admin: adminReducer,
    }
})

export default store;
