import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3300/api/v1/";

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Important for cookie-based auth
});

// Add token from localStorage if exists
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken") || localStorage.getItem("user_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Handle 401/403 errors globally — clear session and redirect to login
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            const hasToken = !!localStorage.getItem("token");
            if (hasToken && !window.location.pathname.includes("/auth/")) {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                window.location.href = "/auth/sign-in";
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
