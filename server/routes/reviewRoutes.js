import express from 'express';
import { createReview, getCourseReviews, getAllReviews } from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, createReview);

router.get('/course/:courseId', getCourseReviews);
router.get('/admin', protect, authorize('admin'), getAllReviews);

export default router;
