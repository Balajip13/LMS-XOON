import express from 'express';
import {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollCourse,
    getEnrolledCourses,
    getAllReviews,
    deleteReview,
} from '../controllers/courseController.js';
import { getCourseQuizForStudent, submitQuizAttempt } from '../controllers/quizController.js';
import { protect, protectOptional, authorize } from '../middleware/authMiddleware.js';
import courseUpload from '../middleware/courseUpload.js';

const router = express.Router();

router.route('/')
    .get(protectOptional, getCourses)
    .post(protect, authorize('admin', 'instructor'), courseUpload.single('thumbnail'), createCourse);

router.get('/enrolled', protect, getEnrolledCourses);

router
    .route('/:id')
    .get(getCourseById)
    .put(protect, authorize('admin', 'instructor'), updateCourse)
    .delete(protect, authorize('admin'), deleteCourse);
router.post('/:id/enroll', protect, enrollCourse);

// Student Quiz Routes
router.get('/:courseId/quiz', protect, getCourseQuizForStudent);
router.post('/:courseId/quiz/submit', protect, submitQuizAttempt);


// Admin Review Management
router.get('/all/reviews', protect, authorize('admin'), getAllReviews);
router.delete('/reviews/:id', protect, authorize('admin'), deleteReview);

export default router;
