import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let getTokenFunction = null;

export const setupStockInterceptor = (store) => {
  getTokenFunction = () => {
    try {
      const state = store.getState();
      const token = state.auth?.token;
      
      if (token && token !== "null" && token !== "undefined") {
        return token;
      }
    } catch (error) {
      console.log("stockService: Error getting token from store:", error);
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


export const getAvailableStock = async (params = {}) => {
  const response = await api.get("/stock/available", { params });
  return response;
};

export const getOutOfStock = async (params = {}) => {
  const response = await api.get("/stock/out-of-stock", { params });
  return response;
};

export const getStockById = async (id) => {
  const response = await api.get(`/stock/${id}`);
  return response;
};

export const addStock = async (stockData) => {
  const response = await api.post("/stock", stockData);
  return response;
};

export const updateStock = async (id, stockData) => {
  const response = await api.put(`/stock/${id}`, stockData);
  return response;
};

export const deleteStock = async (id) => {
  const response = await api.delete(`/stock/${id}`);
  return response;
};

