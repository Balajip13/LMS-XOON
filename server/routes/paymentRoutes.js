import express from 'express';
import { createOrder, verifyPayment, getAllPayments, getMyPayments, getRazorpayConfig } from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/razorpay-config', protect, getRazorpayConfig);
router.post('/order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/my-payments', protect, getMyPayments);
router.get('/admin/all', protect, authorize('admin'), getAllPayments);

export default router;
