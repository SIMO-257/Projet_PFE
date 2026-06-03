import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isGlobalLoading: false,
    isRouteLoading: false,
  },
  reducers: {
    setGlobalLoading: (state, action) => {
      state.isGlobalLoading = action.payload;
    },
    setRouteLoading: (state, action) => {
      state.isRouteLoading = action.payload;
    },
  },
});

export const { setGlobalLoading, setRouteLoading } = uiSlice.actions;
export default uiSlice.reducer;
