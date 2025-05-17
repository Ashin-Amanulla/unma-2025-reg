import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    // Transaction identifiers
    transactionId: { type: String, required: true, unique: true },
    registrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration' },

    // User information (can be null for anonymous payments)
    name: { type: String },
    email: { type: String },
    contactNumber: { type: String },

    // Payment details
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    paymentMethod: { type: String, required: true, enum: ['razorpay', 'cash', 'bank_transfer', 'upi', 'other'] },
    paymentGatewayResponse: { type: Object },

    // Payment status
    status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
        default: 'pending'
    },

    // Purpose of payment
    purpose: {
        type: String,
        required: true,
        enum: ['registration', 'donation', 'sponsorship', 'merchandise', 'other']
    },
    isAnonymous: { type: Boolean, default: false },

    // Additional details
    notes: { type: String },
    metaData: { type: Object },

    // Receipt number
    receiptNumber: { type: String },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
});

// Middleware to update the updatedAt field on save
TransactionSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Set completedAt when status changes to completed
TransactionSchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
        this.completedAt = Date.now();
    }
    next();
});

// Create indexes for better query performance
TransactionSchema.index({ registrationId: 1 });
TransactionSchema.index({ email: 1 });
TransactionSchema.index({ status: 1 });

const Transaction = mongoose.model('Transaction', TransactionSchema);

export default Transaction; 