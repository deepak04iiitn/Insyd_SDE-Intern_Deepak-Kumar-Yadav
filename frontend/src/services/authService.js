import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


const getToken = () => {

  if(typeof window === "undefined") return null;

  try {
    const persistedState = localStorage.getItem("persist:root");

    if(persistedState) {

      const parsed = JSON.parse(persistedState);

      if(parsed.auth) {
        const authState = JSON.parse(parsed.auth);
        return authState.token;
      }
    }

  } catch (error) {
    // Silently handle error and return null
  }
  return null;
};


// Adding token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if(token) {
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

    if(error.response?.status === 401) {
      
      if(typeof window !== "undefined") {
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

