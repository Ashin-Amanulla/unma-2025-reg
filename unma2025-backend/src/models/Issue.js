import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
            enum: ["Technical", "Content", "Payment", "Registration", "Other"],
        },
        priority: {
            type: String,
            required: true,
            enum: ["Low", "Medium", "High", "Critical"],
            default: "Medium",
        },
        status: {
            type: String,
            required: true,
            enum: ["Open", "In Progress", "Resolved", "Closed"],
            default: "Open",
        },
        reportedBy: {
            name: {
                type: String,
                required: true,
            },
            email: {
                type: String,
                required: true,
            },
            phone: {
                type: String,
            },
        },
        attachments: [{
            url: String,
            filename: String,
        }],
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        comments: [{
            text: String,
            createdBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }],
        resolvedAt: Date,
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        resolution: String,
    },
    {
        timestamps: true,
    }
);

const Issue = mongoose.model("Issue", issueSchema); 
export default Issue;