import axios from './axios'; 

/**
 * Issues API Service
 * Handles issue report related API calls
 */
const issuesApi = {
    /**
     * Create a new issue report
     * @param {Object} issueData - Data for the issue report
     * @returns {Promise} - Promise with issue report data
     */
    create: async (issueData) => {
        try {
            const response = await axios.post('/issues', issueData);
            return response.data;
        } catch (error) {
            console.error("Issue API error:", error);
            if (error.response?.data) {
                throw error.response.data;
            } else if (error.message) {
                throw { message: error.message };
            } else {
                throw { message: 'Issue creation failed' };
            }
        }
    },

    /**
     * Get all issue reports with optional query parameters
     * @param {string} queryParams - URL query parameters for filtering
     * @returns {Promise} - Promise with issue reports data
     */
    getAllIssues: async (queryParams = '') => {
        try {
            const url = queryParams ? `/issues?${queryParams}` : '/issues';
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch issues' };
        }
    },

    /**
     * Get issue report by ID
     * @param {string} id - Issue ID
     * @returns {Promise} - Promise with issue report data
     */
    getIssueById: async (id) => {
        try {
            const response = await axios.get(`/issues/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch issue' };
        }
    },

    /**
     * Update an existing issue report
     * @param {string} id - Issue ID
     * @param {Object} updatedIssueData - Updated data for the issue
     * @returns {Promise} - Promise with updated issue data
     */
    updateIssue: async (id, updatedIssueData) => {
        try {
            const response = await axios.put(`/issues/${id}`, updatedIssueData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update issue' };
        }
    },

    /**
     * Delete an issue report by ID
     * @param {string} id - Issue ID
     * @returns {Promise} - Promise with result of the deletion
     */
    deleteIssue: async (id) => {
        try {
            const response = await axios.delete(`/issues/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete issue' };
        }
    },

};

export default issuesApi;
