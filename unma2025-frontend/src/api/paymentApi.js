import axios from './axios';

/**
 * Payment API Service
 * Handles payment related API calls
 */
const paymentApi = {
    /**
     * Create a new payment order
     * @param {Object} data - Payment data
     * @returns {Promise} - Promise with payment order data
     */
    
    createOrder: async (data) => {
        try {

            const response = await axios.post('/payment/create-order', data);
            return response.data;
           
    
       
        } catch (error) {
            console.error('Payment initiation failed:', error);
            throw error.response?.data || { message: 'Payment failed' };
        }
    },

    verifyPayment: async (data) => {
        try {
            const response = await axios.post('/payment/verify-payment', data);
            return response.data;
        } catch (error) {
            console.error('Payment verification failed:', error);
            throw error.response?.data || { message: 'Payment verification failed' };
        }
    },
    createOrderRedirect: async (data) => {
        const res = await axios.post('/payment/redirect-flow/create-order', data);
        return res.data;
      },
    
      createOrderIntent: async (data) => {
        const res = await axios.post('/payment/seamless-flow/create-intent-url', data);
        return res.data;
      },
    
};

export default paymentApi;