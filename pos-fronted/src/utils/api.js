import axios from "axios";
import { getEmployeeAuth, getRestaurantAuth, clearAuth } from "./auth";

const api = axios.create({
  baseURL:  import.meta.env.VITE_API_URL,
});


/* ===== REQUEST INTERCEPTOR ===== */
api.interceptors.request.use(
  (config) => {
    const url = config.url || "";

    // Skip token for auth routes
    const isAuthRoute =
      url.includes("/login") || url.includes("/register");

    if (!isAuthRoute) {
      // Priority: employee > restaurant
      const employeeToken = getEmployeeAuth();
      const restaurantToken = getRestaurantAuth();

      const token = employeeToken || restaurantToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ===== RESPONSE INTERCEPTOR ===== */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    const isAuthRoute =
      url.includes("/login") || url.includes("/register");

    // Auto logout ONLY for protected routes
    if (status === 401 && !isAuthRoute) {
      clearAuth();

      // prevent redirect loop
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
