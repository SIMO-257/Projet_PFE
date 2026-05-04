import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchClientProfile, loginClient, logoutClient, fetchCsrfToken } from '../../services/clientService';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    await fetchCsrfToken();
    await loginClient(credentials);
    const profileResponse = await fetchClientProfile();
    return profileResponse;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: 'Login failed' });
  }
});

export const getProfile = createAsyncThunk('auth/getProfile', async (_, { rejectWithValue }) => {
  try {
    console.log('[THUNK] getProfile: Starting...');
    // Fetch CSRF first to ensure session is initialized
    await fetchCsrfToken();
    console.log('[THUNK] getProfile: CSRF fetched, now fetching profile...');
    const response = await fetchClientProfile();
    console.log('[THUNK] getProfile: Received profile:', response);
    return response;
  } catch (err) {
    console.error('[THUNK] getProfile: Error:', err.message);
    return rejectWithValue(err.response?.data || { message: 'Failed to load profile' });
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await logoutClient();
    localStorage.removeItem('is_authenticated');
    return true;
  } catch (err) {
    localStorage.removeItem('is_authenticated');
    return rejectWithValue(err.response?.data || { message: 'Logout failed' });
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    initialized: false,
    error: null,
  },
  reducers: {
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload?.user ?? action.payload;
        state.initialized = true;
        localStorage.setItem('is_authenticated', 'true');
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.isAuthenticated = false;
        state.initialized = true;
        localStorage.removeItem('is_authenticated');
      })
      .addCase(getProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        console.log('[REDUCER] getProfile.fulfilled: Updating user:', action.payload);
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initialized = true;
        localStorage.setItem('is_authenticated', 'true');
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.user = null;
        state.isAuthenticated = false;
        state.initialized = true;
        localStorage.removeItem('is_authenticated');
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = 'idle';
        state.initialized = true;
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = 'idle';
        state.initialized = true;
      });
  },
});

export const { setAuthenticated } = authSlice.actions;
export default authSlice.reducer;
