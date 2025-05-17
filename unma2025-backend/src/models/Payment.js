import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
    {
        registration: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Registration',
            required: true,
        },
        razorpayPaymentId: {
            type: String,
            trim: true,
        },
        razorpayOrderId: {
            type: String,
            trim: true,
        },
        razorpaySignature: {
            type: String,
            trim: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: 'INR',
        },
        status: {
            type: String,
            enum: ['created', 'authorized', 'captured', 'refunded', 'failed'],
            default: 'created',
        },
        paymentMethod: {
            type: String,
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment; 