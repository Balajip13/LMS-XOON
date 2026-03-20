import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import {
    loginUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    updateNotificationSettings,
    changePassword,
    uploadAvatar,
    getAllUsers,
    updateUserStatus,
    deleteUser,
    getUserEnrollments
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.get('/enrollments', protect, getUserEnrollments);

router.post('/profile/avatar', protect, upload.single('image'), uploadAvatar);
router.put('/change-password', protect, changePassword);
router.put('/notification-settings', protect, updateNotificationSettings);

// Admin Routes
router.route('/')
    .get(protect, authorize('admin'), getAllUsers);

router.route('/:id')
    .delete(protect, authorize('admin'), deleteUser);

router.route('/:id/status')
    .put(protect, authorize('admin'), updateUserStatus);

export default router;
