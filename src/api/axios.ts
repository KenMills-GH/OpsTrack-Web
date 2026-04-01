import axios from "axios";

const configuredApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const normalizedApiBaseUrl = configuredApiBaseUrl.replace(/\/+$/, "");

// 1. Create the base radio instance pointing to Headquarters
const apiClient = axios.create({
  baseURL: normalizedApiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. The Interceptor: Automatically attach the security clearance (JWT)
apiClient.interceptors.request.use(
  (config) => {
    // Grab the token from the browser's local storage
    const token = localStorage.getItem("token");

    // If they have a token, staple it to the HTTP headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
