import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchMyTickets, fetchTicketTypes, purchaseTicket as purchaseTicketApi, validateTicket as validateTicketApi } from '../../services/clientService';
import { updateBalance } from './WalletSlice';

export const getTicketsData = createAsyncThunk('tickets/getData', async (_, { rejectWithValue }) => {
  try {
    console.log('[THUNK] getTicketsData: Starting...');
    const [ticketsRes, typesRes] = await Promise.all([
      fetchMyTickets(),
      fetchTicketTypes()
    ]);
    console.log('[THUNK] getTicketsData: Received data:', { ticketsRes, typesRes });
    return {
      tickets: ticketsRes,
      types: typesRes
    };
  } catch (err) {
    console.error('[THUNK] getTicketsData: Error:', err.message);
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const purchaseTicket = createAsyncThunk('tickets/purchase', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const response = await purchaseTicketApi(payload);
    // Update balance in wallet slice
    if (response.data.new_balance !== undefined) {
        dispatch(updateBalance(response.data.new_balance));
    }
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const validateTicket = createAsyncThunk('tickets/validate', async ({ uuid, validation_type }, { rejectWithValue }) => {
  try {
    const response = await validateTicketApi(uuid, { validation_type });
    return { uuid, ...response.data };
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState: {
    items: [],
    availableTypes: [],
    status: 'idle',
    error: null,
  },

  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTicketsData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getTicketsData.fulfilled, (state, action) => {
        console.log('[REDUCER] getTicketsData.fulfilled: Updating state with:', action.payload);
        state.status = 'succeeded';
        state.items = action.payload.tickets;
        state.availableTypes = action.payload.types;
        console.log('[REDUCER] getTicketsData.fulfilled: New state items:', state.items.length);
      })
      .addCase(getTicketsData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(purchaseTicket.fulfilled, (state, action) => {
        // Add new tickets to the list
        if (action.payload.tickets) {
            state.items = [...action.payload.tickets, ...state.items];
        }
      })
      .addCase(validateTicket.fulfilled, (state, action) => {
        const index = state.items.findIndex(t => t.uuid === action.payload.uuid);
        if (index !== -1) {
            state.items[index] = {
                ...state.items[index],
                remaining_uses: action.payload.remaining_uses,
                status: action.payload.status_after
            };
        }
      });
  },
});

export default ticketsSlice.reducer;
