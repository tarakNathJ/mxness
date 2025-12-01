import axios from "axios";

const api_init = axios.create({
  baseURL: import.meta.env.VITE_API_URL,  
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api_init.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api_init.interceptors.response.use(
  (response) => response,
  (error) => {
    // Safety check: error.response can be undefined (network error)
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      console.warn("Unauthorized");
    }
    return Promise.reject(error);
  }
);

export { api_init };
