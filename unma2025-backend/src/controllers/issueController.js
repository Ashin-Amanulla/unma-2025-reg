import Issue from "../models/Issue.js";
// import {uploadToS3} from "../utils/s3Upload.js";
import {validateObjectId} from "../utils/validation.js";

// Create a new issue
export const createIssue = async (req, res) => {
    try {
        const { title, category, priority, description, reportedBy, attachments } = req.body;

        // Upload attachments to S3 if any
        // const uploadedAttachments = await Promise.all(
        //     attachments.map(async (file) => {
        //         const { url, filename } = await uploadToS3(file);
        //         return { url, filename };
        //     })
        // );

        const issue = await Issue.create({
            title,
            description,
            category,
            priority,
            reportedBy,
            attachments,
        });

        res.status(201).json({
            success: true,
            data: issue,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

// Get all issues (with filters and pagination)
export const getIssues = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            category,
            priority,
            search,
        } = req.query;

        const query = {};
        if (status) query.status = status;
        if (category) query.category = category;
        if (priority) query.priority = priority;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        const issues = await Issue.find(query)
            .populate("assignedTo", "name email")
            .populate("resolvedBy", "name email")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Issue.countDocuments(query);

        res.status(200).json({
            success: true,
            data: issues,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

// Get single issue
export const getIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id)
            .populate("assignedTo", "name email")
            .populate("resolvedBy", "name email")
            .populate("comments.createdBy", "name email");

        if (!issue) {
            return res.status(404).json({
                success: false,
                error: "Issue not found",
            });
        }

        res.status(200).json({
            success: true,
            data: issue,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

// Update issue status
export const updateIssueStatus = async (req, res) => {
    try {
        const { status, resolution } = req.body;
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({
                success: false,
                error: "Issue not found",
            });
        }

        issue.status = status;
        if (status === "Resolved" || status === "Closed") {
            issue.resolvedAt = Date.now();
            issue.resolvedBy = req.user._id;
            issue.resolution = resolution;
        }

        await issue.save();

        res.status(200).json({
            success: true,
            data: issue,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

// Assign issue to admin
export const assignIssue = async (req, res) => {
    try {
        const { assignedTo } = req.body;
        if (!validateObjectId(assignedTo)) {
            return res.status(400).json({
                success: false,
                error: "Invalid admin ID",
            });
        }

        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({
                success: false,
                error: "Issue not found",
            });
        }

        issue.assignedTo = assignedTo;
        issue.status = "In Progress";
        await issue.save();

        res.status(200).json({
            success: true,
            data: issue,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

// Add comment to issue
export const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({
                success: false,
                error: "Issue not found",
            });
        }

        issue.comments.push({
            text,
            createdBy: req.user._id,
        });

        await issue.save();

        res.status(200).json({
            success: true,
            data: issue,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}; 