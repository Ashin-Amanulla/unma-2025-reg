import axios from './axios';
import { otpInstance } from './otpAxios';
import { toast } from 'react-toastify';
/**
 * Registrations API Service
 * Handles event registration related API calls
 */
const registrationsApi = {
 
    create: async (registrationId, payload) => {
        try {
            const response = await axios.post(`/registrations/step/${registrationId || 'new'}`, payload);
            console.log("API response:", response);
            
            return response.data;
        } catch (error) {
            console.error("Registration API error:", error);
          
            if (error.response?.data) {
                throw error.response.data;
            } else if (error.message) {
                throw { message: error.message };
            } else {
                throw { message: 'Registration failed' };
            }
        }
    },


    submitWithoutPayment: async (registrationId, payload) => {
        try {
            const response = await axios.post(`/registrations/step/${registrationId || 'new'}`, payload);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to submit without payment' };
        }
    },

     
    verifyOtp: async (email, phone, otp) => {
        try {
            const response = await otpInstance.post('/registrations/verify-otp', {
                email,
                contactNumber: phone,
                otp
            });
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                return {
                    status: 'error',
                    message: error.response.data.message || 'Invalid OTP. Please try again.',
                    verified: false
                };
            }
            throw new Error(error.response?.data?.message || 'Failed to verify OTP');
        }
    },


   

    processPayment: async (registrationId, paymentDetails) => {
        try {
            const response = await axios.post(`/registrations/${registrationId}/payment`, paymentDetails);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Payment processing failed' };
        }
    },

   
    getAllRegistrations: async (queryParams = '') => {
        try {
            const url = queryParams ? `/registrations?${queryParams}` : '/registrations';
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch registrations' };
        }
    },

    getRegistrationById: async (id) => {
        try {
            const response = await axios.get(`/registrations/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch registration' };
        }
    },

    deleteRegistration: async (id) => {
        try {
            const response = await axios.delete(`/registrations/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete registration' };
        }
    },

    updateRegistration: async (id, registrationData) => {
        try {
            const response = await axios.put(`/registrations/${id}`, registrationData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update registration' };
        }
    },

    sendOtp: async (email, contactNumber) => {
        try {
            const response = await axios.post('/registrations/send-otp', { email, contactNumber });
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
            throw error.response?.data || { message: 'Failed to send OTP' };
        }
    },

    transactionRegister: async (registrationId, payload) => {
        try {
            const response = await axios.post(`/registrations/transaction/${registrationId}`, payload);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to register transaction' };
        }
    },

};

export default registrationsApi; 