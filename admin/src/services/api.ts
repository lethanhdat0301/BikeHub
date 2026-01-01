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

// Handle 401 errors globally
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("Unauthorized access - redirecting to login might be needed");
            // Optional: redirect to login
            // window.location.href = '/auth/sign-in';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
