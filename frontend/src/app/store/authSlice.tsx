import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../lib/axiosClient';
import type { AuthState, User, UserRole } from './types';

interface LoginResponse {
  role: UserRole;
}
interface LoginCredentials {
  email: string;
  password: string;
}

interface ApiResponse<T> {
  data: T;
}

interface AuthStatusResponse {
  data: {
    user: User;
  };
}

export const loginUser = createAsyncThunk<LoginResponse, LoginCredentials, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Logout failed');
  }
});

export const checkAuthStatus = createAsyncThunk<{ user: User }, void, { rejectValue: string }>(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<AuthStatusResponse>('/auth/me');
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Not authenticated');
    }
  }
);

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  role: null,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Add a manual reset action for immediate state clearing
    resetAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.role = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.role = action.payload.role;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(logoutUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
        state.status = 'succeeded'; // Changed from 'idle' to 'succeeded'
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if logout fails, clear the auth state
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
        state.status = 'failed';
      })
      .addCase(checkAuthStatus.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.role = action.payload.user.role;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
        state.status = 'succeeded'; // Changed from 'idle' to 'succeeded'
        state.error = null;
      });
  },
});

export const { resetAuth } = authSlice.actions;
export default authSlice.reducer;