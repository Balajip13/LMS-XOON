import express from 'express';
import {
    getAnnouncements,
    createAnnouncement,
    getInstructorAnnouncements,
    deleteAnnouncement
} from '../controllers/announcementController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getAnnouncements)
    .post(protect, authorize('instructor', 'admin'), createAnnouncement);

router.get('/instructor', protect, authorize('instructor'), getInstructorAnnouncements);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteAnnouncement);

export default router;
