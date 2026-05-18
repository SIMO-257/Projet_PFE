import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminLogin, adminLogout, adminMe, updateAdminProfile } from '../../services/adminService';

export const loginAdmin = createAsyncThunk('admin/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await adminLogin(credentials);
    const { token, admin } = response.data;
    localStorage.setItem('admin_token', token);
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
    localStorage.removeItem('admin_token');
    return true;
  } catch (err) {
    localStorage.removeItem('admin_token');
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
    token: localStorage.getItem('admin_token'),
    isAuthenticated: !!localStorage.getItem('admin_token'),
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
      .addCase(fetchAdminMe.fulfilled, (state, action) => {
        state.admin = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchAdminMe.rejected, (state) => {
        state.admin = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('admin_token');
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
