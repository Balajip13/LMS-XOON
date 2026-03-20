import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getPayouts, requestPayout, updatePayoutStatus } from '../controllers/payoutController.js';

const router = express.Router();

router.route('/')
    .get(protect, authorize('admin'), getPayouts)
    .post(protect, authorize('instructor'), requestPayout);

router.route('/:id/status')
    .put(protect, authorize('admin'), updatePayoutStatus);

export default router;
