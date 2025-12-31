import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let getTokenFunction = null;

export const setupExpiringSoonInterceptor = (store) => {
  getTokenFunction = () => {
    try {
      const state = store.getState();
      const token = state.auth?.token;
      
      if (token && token !== "null" && token !== "undefined") {
        return token;
      }
    } catch (error) {
      console.log("expiringSoonService: Error getting token from store:", error);
    }
    return null;
  };
};

// Adding token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = getTokenFunction ? getTokenFunction() : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        
        if (currentPath === "/login") {
          return Promise.reject(error);
        }

        localStorage.removeItem("persist:root");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);


export const getExpiringSoon = async (params = {}) => {
  const response = await api.get("/expiring-soon/expiring-soon", { params });
  return response;
};

export const getExpired = async (params = {}) => {
  const response = await api.get("/expiring-soon/expired", { params });
  return response;
};

