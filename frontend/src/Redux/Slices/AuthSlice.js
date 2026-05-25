import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { clearAuthData, fetchUserProfile, loginUser, logoutUser, setAuthToken } from '../../services/clientService';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const loginRes = await loginUser(credentials);
    const token = loginRes.data?.data?.access_token;
    if (token) {
      setAuthToken(token, Boolean(credentials?.remember_me));
    }
    const profileResponse = await fetchUserProfile();
    return profileResponse;
  } catch (err) {
    clearAuthData();
    return rejectWithValue(err.response?.data || { message: 'Login failed' });
  }
});

export const getProfile = createAsyncThunk('auth/getProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await fetchUserProfile();
    return response;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: 'Failed to load profile' });
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await logoutUser();
    clearAuthData();
    return true;
  } catch (err) {
    clearAuthData();
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
    markAuthCheckedUnauthenticated: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.initialized = true;
      state.error = null;
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
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.isAuthenticated = false;
        state.initialized = true;
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
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.user = null;
        state.isAuthenticated = false;
        state.initialized = true;
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

export const { setAuthenticated, markAuthCheckedUnauthenticated } = authSlice.actions;
export default authSlice.reducer;
