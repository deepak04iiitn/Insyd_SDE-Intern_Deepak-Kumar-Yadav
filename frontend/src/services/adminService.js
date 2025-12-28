import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let getTokenFunction = null;

export const setupAdminInterceptor = (store) => {
  getTokenFunction = () => {

    try {

      const state = store.getState();
      const token = state.auth?.token;
      
      if(token && token !== "null" && token !== "undefined") {
        // console.log("adminService: Token found in Redux store");
        return token;
      } else {
        console.log("adminService: No valid token in Redux store");
      }
    } catch (error) {
      console.log("adminService: Error getting token from store:", error);
    }

    return null;
  };
};


// Adding token to requests if available
api.interceptors.request.use(
  (config) => {

    const token = getTokenFunction ? getTokenFunction() : null;

    // console.log("adminService interceptor - Token:", token ? "Exists" : "Missing");
    // console.log("Request URL:", config.url);

    if(token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log("adminService: Authorization header set");
    } else {
      console.log("adminService: No token to add to headers");
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
        
        if(currentPath === "/login") {
          return Promise.reject(error);
        }

        // console.log("adminService: 401 Error - Redirecting to login");
        localStorage.removeItem("persist:root");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export const getAllUsers = async () => {
  const response = await api.get("/admin/users");
  return response;
};

export const getPendingUsers = async () => {
  const response = await api.get("/admin/users/pending");
  return response;
};

export const approveUser = async (email) => {
  const response = await api.post("/admin/users/approve", { email });
  return response;
};

export const rejectUser = async (email) => {
  const response = await api.post("/admin/users/reject", { email });
  return response;
};

export const addPreApprovedEmail = async (email) => {
  const response = await api.post("/admin/users/pre-approve", { email });
  return response;
};