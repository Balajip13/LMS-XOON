import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import resumeUpload from '../middleware/resumeUpload.js';
import {
    submitApplication,
    downloadResume,
    serveResume,
    getAllApplications,
    getPendingApplications,
    reviewApplication,
    getMyApplication,
    removeInstructor
} from '../controllers/instructorController.js';
import { getCourses } from '../controllers/courseController.js'; // reusing public/shared route for courses if needed, or we fetch via dashboard

import {
    getDashboardOverview,
    getInstructorStudents,
    getInstructorEarnings,
    getInstructorReviews,
    getInstructorReports
} from '../controllers/instructorDashboardController.js';

import {
    createAssignment,
    getAssignments,
    updateAssignment,
    deleteAssignment,
    gradeSubmission
} from '../controllers/assignmentController.js';

import {
    createQuiz,
    getQuizzes,
    updateQuiz,
    deleteQuiz
} from '../controllers/quizController.js';


const router = express.Router();

// Application Routes
router.post('/apply', protect, resumeUpload.single('resume'), submitApplication);
router.get('/my-application', protect, getMyApplication);

// Resume file serving routes
router.get('/resume/view/:filename', serveResume);
router.get('/resume/download/:filename', protect, downloadResume); // Protected download route
router.get('/resume/:filename', protect, serveResume);

// Admin approval routes (must be before instructor authorization)
router.get('/applications', protect, authorize('admin'), getAllApplications);
router.put('/applications/:id/review', protect, authorize('admin'), reviewApplication);
router.delete('/:id', protect, authorize('admin'), removeInstructor);

// Admin approval routes (alternative endpoints for convenience)
router.put('/approve/:id', protect, authorize('admin'), async (req, res) => {
    req.body.status = 'approved';
    req.body.rejectionReason = '';
    return reviewApplication(req, res);
});

router.put('/reject/:id', protect, authorize('admin'), async (req, res) => {
    req.body.status = 'rejected';
    return reviewApplication(req, res);
});

// --- INSTRUCTOR DASHBOARD ROUTES ---
router.use(protect, authorize('instructor', 'admin')); // All below require instructor or admin role

// Dashboard Overview & Stats
router.get('/dashboard/overview', getDashboardOverview);
router.get('/students', getInstructorStudents);
router.get('/earnings', getInstructorEarnings);
router.get('/reviews', getInstructorReviews);
router.get('/reports', getInstructorReports);

// Note: For "My Courses", we can use the existing `GET /api/courses` which already filters by `req.user.role === 'instructor'` when logged in as an instructor, 
// or we can just call it from the frontend directly. Let's add an alias just in case:
router.get('/courses', getCourses);

// Assignments
router.route('/assignments')
    .post(createAssignment)
    .get(getAssignments);
router.route('/assignments/:id')
    .put(updateAssignment)
    .delete(deleteAssignment);
router.put('/assignments/:id/grade/:studentId', gradeSubmission);

// Quizzes
router.route('/quizzes')
    .post(createQuiz)
    .get(getQuizzes);
router.route('/quizzes/:id')
    .put(updateQuiz)
    .delete(deleteQuiz);

export default router;
