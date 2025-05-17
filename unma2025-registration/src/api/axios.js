import axios from 'axios';

// Define base API URL based on environment
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds
});



// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('adminToken');

        // If token exists, add to headers
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for handling common errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized errors
        if (error.response && error.response.status === 401) {
            // Clear local storage and redirect to login
            localStorage.removeItem('adminToken');
            window.location.href = '/admin/login';
        }

        return Promise.reject(error);
    }
);

export default axiosInstance; 