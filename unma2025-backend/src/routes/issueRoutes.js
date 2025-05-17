import express from 'express';
const router = express.Router();
import multer from 'multer';
import { verifyToken, verifyAdmin } from '../middleware/auth.js'; 
import {
    createIssue,
    getIssues,
    getIssue,
    updateIssueStatus,
    assignIssue,
    addComment,
} from "../controllers/issueController.js";

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

// Public routes
router.post("/", upload.array("attachments", 5), createIssue);

// Protected routes (admin only)
router.use(verifyToken);  // Apply token verification to the remaining routes
router.use(verifyAdmin);

router.get("/", getIssues);
router.get("/:id", getIssue);
router.patch("/:id/status", updateIssueStatus);
router.patch("/:id/assign", assignIssue);
router.post("/:id/comments", addComment);


export default router; 