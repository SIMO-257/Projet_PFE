import { configureStore } from "@reduxjs/toolkit";
import TickReducer from './Slices/ticketsslice';
const store = configureStore({
    reducer:{
        Tickets:TickReducer
    }
})
export default store