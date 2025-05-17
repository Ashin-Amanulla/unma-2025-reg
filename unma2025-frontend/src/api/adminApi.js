import axios from './axios';

/**
 * Admin API Service
 * Handles admin dashboard related API calls
 */
const adminApi = {
    /**
     * Get dashboard statistics
     * @returns {Promise} - Promise with dashboard stats
     */
    getDashboardStats: async () => {
        try {
            const response = await axios.get('/admin/dashboard-stats');
            console.log(response.data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch dashboard data' };
        }
    },

    /**
     * Get all registrations with optional filters
     * @param {Object} filters - Optional filters for registrations
     * @returns {Promise} - Promise with registrations list
     */
    getRegistrations: async (filters = {}) => {
        try {
            const response = await axios.get('/admin/registrations', { params: filters });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch registrations' };
        }
    },

    /**
     * Get registration details by ID
     * @param {number} id - Registration ID
     * @returns {Promise} - Promise with registration details
     */
    getRegistrationById: async (id) => {
        try {
            const response = await axios.get(`/admin/registrations/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch registration details' };
        }
    },

    /**
     * Update registration details
     * @param {number} id - Registration ID
     * @param {Object} data - Updated registration data
     * @returns {Promise} - Promise with updated registration
     */
    updateRegistration: async (id, data) => {
        try {
            const response = await axios.put(`/admin/registrations/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update registration' };
        }
    },

    /**
     * Delete a registration
     * @param {number} id - Registration ID
     * @returns {Promise} - Promise with deletion result
     */
    deleteRegistration: async (id) => {
        try {
            const response = await axios.delete(`/admin/registrations/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete registration' };
        }
    },

    /**
     * Export registrations as CSV
     * @param {Object} filters - Optional filters for export
     * @returns {Promise} - Promise with CSV data
     */
    exportRegistrations: async (filters = {}) => {
        try {
            const response = await axios.get('/admin/registrations/export', {
                params: filters,
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to export registrations' };
        }
    },

    /**
     * Get admin settings
     * @returns {Promise} - Promise with admin settings
     */
    getSettings: async () => {
        try {
            const response = await axios.get('/admin/settings');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch settings' };
        }
    },

    /**
     * Update admin settings
     * @param {Object} data - Updated settings data
     * @returns {Promise} - Promise with updated settings
     */
    updateSettings: async (data) => {
        try {
            const response = await axios.put('/admin/settings', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update settings' };
        }
    },

    /**
     * Admin login
     * @param {Object} credentials - Login credentials
     * @returns {Promise} - Promise with login result
     */
    login: async (credentials) => {
        try {
            const response = await axios.post('/admin/login', credentials);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Login failed' };
        }
    },

    getAnalytics: async () => {
        try {
            const response = await axios.get('/admin/analytics');
            console.log("analytics", response);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch analytics' }; 
        }
    }   
    
};





export default adminApi; 