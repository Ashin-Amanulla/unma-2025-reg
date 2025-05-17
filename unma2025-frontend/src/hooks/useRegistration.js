import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const REGISTRATION_KEYS = {
    VERIFY: 'registration-verify',
    SUBMIT: 'registration-submit',
    OTP: 'registration-otp',
};

export default function useRegistration() {
    const queryClient = useQueryClient();

    // Function to send OTP to email
    const sendOtpMutation = useMutation({
        mutationFn: async (email) => {
            const response = await fetch('/api/registrations/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to send OTP');
            }

            return response.json();
        },
        onSuccess: () => {
            toast.success('OTP sent to your email address');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to send OTP');
        },
    });

    // Function to verify OTP
    const verifyOtpMutation = useMutation({
        mutationFn: async ({ email, otp }) => {
            const response = await fetch('/api/registrations/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Invalid OTP');
            }

            return response.json();
        },
        onSuccess: () => {
            toast.success('Email verified successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Invalid OTP');
        },
    });

    // Function to submit registration
    const submitRegistrationMutation = useMutation({
        mutationFn: async (formData) => {
            const { registrationId, registrationToken, action = 'create' } = formData;

            const endpoint = action === 'update' && registrationId
                ? `/api/registrations/step/${registrationId}`
                : '/api/registrations/step/new';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Registration failed');
            }

            return response.json();
        },
        onSuccess: (data) => {
            if (data.status === 'success') {
                return data;
            }
            throw new Error(data.message || 'Registration failed');
        },
        onError: (error) => {
            toast.error(error.message || 'Registration failed');
            throw error;
        },
    });

    // Function to verify registration status
    const verifyRegistration = async (registrationId) => {
        try {
            const response = await fetch(`/api/registrations/verify/${registrationId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Verification failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Verification error:', error);
            return {
                success: false,
                error: error.message || 'Verification failed'
            };
        }
    };

    // Function to create payment order
    const createPaymentOrderMutation = useMutation({
        mutationFn: async ({ amount, registrationId }) => {
            const response = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount, registrationId }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Payment initialization failed');
            }

            return response.json();
        },
        onError: (error) => {
            toast.error(error.message || 'Payment initialization failed');
        },
    });

    // Function to verify payment
    const verifyPaymentMutation = useMutation({
        mutationFn: async (paymentData) => {
            const response = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Payment verification failed');
            }

            return response.json();
        },
        onSuccess: () => {
            toast.success('Payment verified successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Payment verification failed');
        },
    });

    // Calculate contribution based on attendees
    const calculateContribution = (attendees) => {
        const adultRate = 500;
        const teenRate = 250;
        const childRate = 150;
        const toddlerRate = 0;

        const totalAdult = (attendees.adult || 0) * adultRate;
        const totalTeen = (attendees.teenChildren || 0) * teenRate;
        const totalChild = (attendees.youngChildren || 0) * childRate;
        const totalToddler = (attendees.toddlers || 0) * toddlerRate;

        return totalAdult + totalTeen + totalChild + totalToddler;
    };

    return {
        // Mutations
        sendOtp: sendOtpMutation.mutate,
        verifyOtp: verifyOtpMutation.mutate,
        submitRegistration: submitRegistrationMutation.mutate,
        createPaymentOrder: createPaymentOrderMutation.mutate,
        verifyPayment: verifyPaymentMutation.mutate,

        // Queries
        verifyRegistration,

        // Utility functions
        calculateContribution,

        // Loading states
        isSendingOtp: sendOtpMutation.isPending,
        isVerifyingOtp: verifyOtpMutation.isPending,
        isSubmitting: submitRegistrationMutation.isPending,
        isCreatingPaymentOrder: createPaymentOrderMutation.isPending,
        isVerifyingPayment: verifyPaymentMutation.isPending,
    };
} 