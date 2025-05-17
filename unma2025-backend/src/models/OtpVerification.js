import mongoose from 'mongoose';

const OtpVerificationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    contactNumber: {
        type: String,
        required: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600 // Automatically expire after 1 hour (in seconds)
    },
    verified: {
        type: Boolean,
        default: false
    },
    verifiedAt: {
        type: Date
    },
    purpose: {
        type: String,
        enum: ['registration', 'reset-password', 'email-change'],
        default: 'registration'
    },
    attempts: {
        type: Number,
        default: 0,
        max: 5
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
});

// Index for quick lookups
OtpVerificationSchema.index({ email: 1, contactNumber: 1 });

// Create automatic TTL index for cleanup

const OtpVerification = mongoose.model('OtpVerification', OtpVerificationSchema);

export default OtpVerification; 