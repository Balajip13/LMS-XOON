import express from 'express';
import { getAllEnrollments, freeEnroll, checkEnrollment, getEnrollmentDetail, completeLesson, updateTimeSpent, updateLessonDuration, initiateEnrollment } from '../controllers/enrollmentController.js';
import { protect, authorize, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/all', protect, authorize('admin'), getAllEnrollments);
router.get('/check/:courseId', protect, checkEnrollment);
router.get('/detail/:courseId', protect, getEnrollmentDetail);
router.post('/complete-lesson', protect, completeLesson);
router.post('/update-time', protect, updateTimeSpent);
router.post('/update-lesson-duration', protect, updateLessonDuration);
router.post('/free', protect, freeEnroll);
router.post('/initiate', protect, initiateEnrollment);

export default router;
