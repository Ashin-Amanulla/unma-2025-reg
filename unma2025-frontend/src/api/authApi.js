import axios from './axios';

/**
 * Auth API Service
 * Handles authentication related API calls
 */
const authApi = {
    /**
     * Login with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} - Promise with user data and token
     */
    login: async (data ) => {
        try {
            const response = await axios.post('/auth/login', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Login failed' };
        }
    },

    /**
     * Logout current user
     * @returns {Promise} - Promise with logout status
     */
    logout: async () => {
        try {
            const response = await axios.post('/auth/logout');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Logout failed' };
        }
    },

    /**
     * Verify token validity
     * @returns {Promise} - Promise with verification result
     */
    verifyToken: async () => {
        try {
            const response = await axios.get('/auth/verify');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Token verification failed' };
        }
    },
};

export default authApi; 