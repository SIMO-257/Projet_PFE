import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminLogin, adminLogout, adminMe, updateAdminProfile, getAdminToken, setAdminToken, clearAdminToken } from '../../services/adminService';

export const loginAdmin = createAsyncThunk('admin/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await adminLogin(credentials);
    const { token, admin } = response.data;
    setAdminToken(token, true);
    return { admin, token };
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: 'Admin login failed' });
  }
});

export const updateAdmin = createAsyncThunk('admin/update', async (data, { rejectWithValue }) => {
  try {
    const response = await updateAdminProfile(data);
    return response.data.admin;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: 'Update failed' });
  }
});

export const logoutAdmin = createAsyncThunk('admin/logout', async (_, { rejectWithValue }) => {
  try {
    await adminLogout();
    clearAdminToken();
    return true;
  } catch (err) {
    clearAdminToken();
    return rejectWithValue(err.response?.data || { message: 'Logout failed' });
  }
});

export const fetchAdminMe = createAsyncThunk('admin/me', async (_, { rejectWithValue }) => {
  try {
    const response = await adminMe();
    return response.data.admin;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: 'Failed to fetch admin profile' });
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    admin: null,
    token: getAdminToken(),
    isAuthenticated: !!getAdminToken(),
    loading: false,
    error: null,
  },
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.admin = action.payload.admin;
        state.token = action.payload.token;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.admin = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutAdmin.rejected, (state) => {
        state.admin = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(fetchAdminMe.fulfilled, (state, action) => {
        state.admin = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchAdminMe.rejected, (state) => {
        state.admin = null;
        state.token = null;
        state.isAuthenticated = false;
        clearAdminToken();
      })
      .addCase(updateAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
      })
      .addCase(updateAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
