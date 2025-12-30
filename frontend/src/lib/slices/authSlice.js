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


export const logoutAsync = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.logout();
      return response.data;
    } catch (error) {
      // Even if the API call fails, we should still logout locally
      return rejectWithValue(
        error.response?.data?.message || "Logout failed"
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

        if(errorMessage.includes("401") || errorMessage.includes("Unauthorized") || errorMessage.includes("Not authorized")) {
          if(!state.user) {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
          }
        }
        
      })

      .addCase(logoutAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutAsync.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

