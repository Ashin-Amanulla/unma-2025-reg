import { useState } from 'react';
import { toast } from 'react-toastify';
import paymentApi from '../api/paymentApi';

export const usePayment = () => {
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

    const initiatePayment = async ({
        amount,
        name,
        email,
        contact,
        notes = {},
        onSuccess,
        onFailure,
    }) => {
        try {
            setIsPaymentProcessing(true);

            console.log(amount, "amount");
            // Create order through API
            const res = await paymentApi.createOrder({ amount });
         
         console.log('res',res);
            const { id, amount: orderAmount, currency } = res;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderAmount,
                currency: currency,
                name: "UNMA Registration 2025",
                description: "Registration Contribution",
                order_id: id,
                handler: async (response) => {
                    try {
                        // Verify payment
                        await paymentApi.verifyPayment(response);
                        toast.success("Payment successful!");
                        onSuccess?.(response);
                    } catch (err) {
                        console.error("Payment verification failed:", err);
                        toast.error("Payment verification failed. Please contact support.");
                        onFailure?.(err);
                    }
                },
                prefill: {
                    name,
                    email,
                    contact,
                },
                notes,
                theme: {
                    color: "#4F46E5",
                },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

            paymentObject.on("payment.failed", (response) => {
                console.error("Payment failed:", response);
                toast.error("Payment failed. Please try again.");
                onFailure?.(response);
            });
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("Payment failed. Please try again.");
            onFailure?.(error);
        } finally {
            setIsPaymentProcessing(false);
        }
    };

    return {
        isPaymentProcessing,
        initiatePayment,
    };
}; 