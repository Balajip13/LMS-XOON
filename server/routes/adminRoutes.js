import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getDashboardStats, getSystemSettings, updateSystemSettings } from '../controllers/adminController.js';
import { getPendingApplications, getAllApplications } from '../controllers/instructorController.js';
import { getAllUsers, updateUserStatus, deleteUser } from '../controllers/userController.js';
import {
    exportUsers,
    exportInstructors,
    exportEnrollments,
    exportPayments,
    exportReports
} from '../controllers/adminExportController.js';

const router = express.Router();

router.get('/stats', protect, authorize('admin'), getDashboardStats);
router.get('/settings', protect, authorize('admin'), getSystemSettings);
router.put('/settings', protect, authorize('admin'), updateSystemSettings);
router.get('/instructor-requests', protect, authorize('admin'), getPendingApplications);
router.get('/instructor-applications', protect, authorize('admin'), getAllApplications);

// User Management Routes
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/status', protect, authorize('admin'), updateUserStatus);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

// Export Routes
router.get('/users/export', protect, authorize('admin'), exportUsers);
router.get('/instructors/export', protect, authorize('admin'), exportInstructors);
router.get('/enrollments/export', protect, authorize('admin'), exportEnrollments);
router.get('/payments/export', protect, authorize('admin'), exportPayments);
router.get('/reports/export', protect, authorize('admin'), exportReports);

export default router;
