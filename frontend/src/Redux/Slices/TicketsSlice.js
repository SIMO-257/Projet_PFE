import { createSlice } from "@reduxjs/toolkit";
const initialState = [
    {
        id: 1,
        title: "Single Ticket",
        status: "Active",
        description: "Valid for one journey",
        price: "8 DH",
        validInfo: "Valid until",
        validPeriod:"7 jours",
        validTime: "18:30 Today",
        buttonText: "View Ticket",
        buttonVariant: "primary",
        isActive: true
    }
]

const TicketSilce = createSlice({
    name: "tickets",
    initialState,    
    reducers:{}
})

export default TicketSilce.reducer;