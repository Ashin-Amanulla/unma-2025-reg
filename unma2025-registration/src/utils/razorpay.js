export const loadScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

export const createRazorpayOrder = async (amount) => {
    try {
        const response = await fetch("/api/create-razorpay-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                amount: amount * 100, // Convert to paise
            }),
        });
        return await response.json();
    } catch (error) {
        throw new Error("Failed to create order");
    }
};

export const verifyPayment = async (paymentData) => {
    try {
        const response = await fetch("/api/verify-payment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(paymentData),
        });
        return await response.json();
    } catch (error) {
        throw new Error("Payment verification failed");
    }
}; 