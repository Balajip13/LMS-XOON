import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import courseUpload from '../middleware/courseUpload.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

const router = express.Router();

// @desc    Upload a video to Cloudinary
// @route   POST /api/upload/video
// @access  Private/Instructor/Admin
router.post('/video', protect, authorize('instructor', 'admin'), courseUpload.single('video'), async (req, res) => {
    try {
        console.log("File:", req.file);

        if (!req.file) {
            return res.status(400).json({ message: 'No video file uploaded' });
        }

        // Manual upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'xoon_lms/videos',
            resource_type: "video"
        });

        console.log("Cloudinary result:", result);

        // Cleanup local file
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.json({
            success: true,
            url: result.secure_url
        });
    } catch (err) {
        console.error("Video upload failed:", err);
        
        // Cleanup on failure
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            message: "Video upload failed",
            error: err.message
        });
    }
});

// @desc    Upload a thumbnail to Cloudinary
// @route   POST /api/upload/thumbnail
// @access  Private/Instructor/Admin
router.post('/thumbnail', protect, authorize('instructor', 'admin'), courseUpload.single('thumbnail'), async (req, res) => {
    try {
        console.log("File:", req.file);

        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }

        // Manual upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'xoon_lms/thumbnails',
            resource_type: "image"
        });

        console.log("Cloudinary result:", result);

        // Cleanup local file
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.json({
            success: true,
            url: result.secure_url
        });
    } catch (err) {
        console.error("Thumbnail upload failed:", err);

        // Cleanup on failure
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            message: "Thumbnail upload failed",
            error: err.message
        });
    }
});

export default router;
