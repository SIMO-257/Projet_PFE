import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWalletDetails, fetchTransactionHistory } from '../../services/clientService';

export const getWalletData = createAsyncThunk('wallet/getData', async (_, { rejectWithValue }) => {
  try {
    console.log('[THUNK] getWalletData: Starting...');
    const [walletRes, transRes] = await Promise.all([
      fetchWalletDetails(),
      fetchTransactionHistory()
    ]);
    console.log('[THUNK] getWalletData: Received data:', { walletRes, transRes });
    return {
      wallet: walletRes,
      transactions: transRes
    };
  } catch (err) {
    console.error('[THUNK] getWalletData: Error:', err.message);
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    balance: 0,
    card_last_four: '****',
    transactions: [],
    status: 'idle',
    error: null,
  },

  reducers: {
    updateBalance: (state, action) => {
      state.balance = action.payload;
    },
    resetState: (state) => {
      state.balance = 0;
      state.card_last_four = '****';
      state.transactions = [];
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getWalletData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getWalletData.fulfilled, (state, action) => {
        console.log('[REDUCER] getWalletData.fulfilled: Updating state with:', action.payload);
        state.status = 'succeeded';
        state.balance = action.payload.wallet.balance;
        state.card_last_four = action.payload.wallet.card_last_four;
        state.transactions = action.payload.transactions;
        console.log('[REDUCER] getWalletData.fulfilled: New balance:', state.balance);
      })
      .addCase(getWalletData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { updateBalance, resetState } = walletSlice.actions;
export default walletSlice.reducer;
