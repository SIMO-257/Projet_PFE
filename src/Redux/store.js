import { configureStore } from "@reduxjs/toolkit";
import TicketsReducer from "./Slices/TicketsSlice";
import PurchasesReducer from "./Slices/PurchaseseSlice";
const store = configureStore({
    reducer:{
        Tickets:TicketsReducer,
        Purchases:PurchasesReducer
    }
})
export default store