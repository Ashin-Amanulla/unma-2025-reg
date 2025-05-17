import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address'
        ]
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['super_admin', 'admin'],
        default: 'admin'
    },
    district: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    passwordResetToken: String,
    passwordResetExpires: Date
}, {
    timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function (next) {
    // Only hash the password if it's modified or new
    if (!this.isModified('password')) return next();

    try {
        // Generate salt
        const salt = await bcrypt.genSalt(10);
        // Hash password
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
adminSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to update last login
adminSchema.methods.updateLastLogin = async function () {
    this.lastLogin = new Date();
    return this.save();
};

// Indexes
adminSchema.index({ role: 1 });

const Admin = mongoose.model('Admin', adminSchema);

export default Admin; 