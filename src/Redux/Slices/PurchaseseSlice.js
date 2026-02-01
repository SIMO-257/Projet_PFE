import { createSlice } from "@reduxjs/toolkit";
const initialState = [
    {
      id: 2,
      title: "Daily Ticket",
      status: "Inactive",
      description: "1 journey",
      price: 8,
      duration: "7 Days",
      buttonText: "Purchase Ticket",
      buttonVariant: "secondary",
      isActive: false
    },
    {
      id: 3,
      title: "Daily Ticket",
      status: "Inactive",
      description: "2 journeys",
      price: 14,
      duration: "7 Days",
      buttonText: "Purchase Ticket",
      buttonVariant: "secondary",
      isActive: false
    },
    {
      id: 4,
      title: "Weekly Pass",
      status: "Inactive",
      description: "Unlimited journeys",
      price: 60,
      duration: "7 Days",
      buttonText: "Purchase Ticket",
      buttonVariant: "secondary",
      isActive: false
    },
    {
      id: 5,
      title: "Monthly Pass",
      status: "Inactive",
      description: "Unlimited journeys",
      price: 230,
      duration: "30 Days",
      buttonText: "Purchase Ticket",
      buttonVariant: "secondary",
      isActive: false
    }
]

const  PurchasesSilce = createSlice({
    name: "purchases",
    initialState,    
    reducers:{}
})

export default  PurchasesSilce.reducer;