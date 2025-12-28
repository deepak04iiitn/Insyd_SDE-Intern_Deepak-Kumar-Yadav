import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { REHYDRATE } from "redux-persist";
import * as authService from "../../services/authService";

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};


// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {

    try {
      const response = await authService.login(credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }

  }
);


export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {

    try {
      const response = await authService.register(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }

  }
);


export const getMe = createAsyncThunk(
  "auth/getMe",
  async (_, { rejectWithValue }) => {

    try {
      const response = await authService.getMe();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user"
      );
    }
    
  }
);


// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Handle Redux Persist rehydration
      .addCase(REHYDRATE, (state, action) => {
        // When state is rehydrated from localStorage, restore authentication
        if (action.payload && action.payload.auth) {
          const { token, user } = action.payload.auth;
          
          // Only restore authenticated state if we have both token and user
          if (token && user) {
            state.token = token;
            state.user = user;
            state.isAuthenticated = true;
            state.isLoading = false;
            console.log("✅ Auth state rehydrated successfully");
          } else if (token && !user) {
            // If we have token but no user, we'll fetch user data via getMe
            state.token = token;
            state.isAuthenticated = false; // Will be set to true after getMe succeeds
            state.isLoading = false;
            console.log("⚠️ Token restored but no user data - will fetch via getMe");
          } else {
            // No valid data to restore
            state.isAuthenticated = false;
            state.isLoading = false;
            console.log("ℹ️ No auth state to rehydrate");
          }
        }
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })

      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })

      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.isLoading = false;
        const errorMessage = String(action.payload || "");

        // Only clear auth state if we get a clear 401/Unauthorized error
        // Don't clear if it's a network error or other issues
        if(errorMessage.includes("401") || errorMessage.includes("Unauthorized") || errorMessage.includes("Not authorized")) {
          // Only clear if we don't already have user data (might be a stale token)
          // If we have user data from login, keep it even if getMe fails
          if(!state.user) {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
          }
        }
        
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

