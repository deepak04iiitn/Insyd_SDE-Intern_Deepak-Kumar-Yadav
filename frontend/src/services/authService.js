import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// This will be set by setupAuthInterceptor
let getTokenFunction = null;

export const setupAuthInterceptor = (store) => {
  getTokenFunction = () => {
    try {
      const state = store.getState();
      const token = state.auth?.token;
      
      if (token && token !== "null" && token !== "undefined") {
        console.log("✅ authService: Token found in Redux store");
        return token;
      } else {
        console.log("❌ authService: No valid token in Redux store");
      }
    } catch (error) {
      console.log("❌ authService: Error getting token from store:", error);
    }
    return null;
  };
};

// Adding token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = getTokenFunction ? getTokenFunction() : null;

    console.log("🔐 authService interceptor - Token:", token ? "✅ Exists" : "❌ Missing");
    console.log("📍 Request URL:", config.url);

    if(token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ authService: Authorization header set");
    } else {
      console.log("❌ authService: No token to add to headers");
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }

);


// Handling token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {

    if(error.response?.status === 401) {
      
      if(typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        
        // Don't redirect if already on login page or during login/register
        if(currentPath === "/login" || currentPath === "/register") {
          return Promise.reject(error);
        }

        // Only redirect if we're not in the middle of an auth flow
        // Check if the error is from getMe endpoint and we might be in a protected route
        const isGetMeRequest = error.config?.url?.includes("/auth/me");
        
        if(isGetMeRequest) {
          // For getMe failures, let the ProtectedRoute handle it
          // Don't redirect immediately as it might be a timing issue
          return Promise.reject(error);
        }

        localStorage.removeItem("persist:root");
        window.location.href = "/login";
      }

    }

    return Promise.reject(error);
    
  }
);


export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response;
};

export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response;
};

export const getMe = async () => {
  const response = await api.get("/auth/me");
  return response;
};
