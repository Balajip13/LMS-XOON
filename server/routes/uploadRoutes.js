import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import courseUpload from '../middleware/courseUpload.js';

const router = express.Router();

// @desc    Upload a video to Cloudinary
// @route   POST /api/upload/video
// @access  Private/Instructor/Admin
router.post('/video', protect, authorize('instructor', 'admin'), courseUpload.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No video file uploaded' });
    }

    console.log("Video uploaded to Cloudinary:", req.file.path);

    res.status(200).json({
        success: true,
        url: req.file.path
    });
});

// @desc    Upload a thumbnail to Cloudinary
// @route   POST /api/upload/thumbnail
// @access  Private/Instructor/Admin
router.post('/thumbnail', protect, authorize('instructor', 'admin'), courseUpload.single('thumbnail'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded' });
    }

    console.log("Thumbnail uploaded to Cloudinary:", req.file.path);

    res.status(200).json({
        success: true,
        url: req.file.path
    });
});

export default router;
