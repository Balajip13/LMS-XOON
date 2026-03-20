import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Settings from '../models/Settings.js';

const getRazorpaySecret = () => {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
        const err = new Error('Payment service is not configured');
        err.statusCode = 500;
        throw err;
    }
    return secret;
};

// @desc    Get Razorpay Public Configuration
// @route   GET /api/payments/razorpay-config
// @access  Private (Checkout requires auth)
const getRazorpayConfig = async (req, res) => {
    try {
        const settings = await Settings.findOne();
        res.json({
            keyId: settings?.razorpayConfig?.keyId || '',
            enabled: settings?.razorpayConfig?.enabled || false
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch payment configuration' });
    }
};

// @desc    Create Razorpay Order
// @route   POST /api/payments/order
// @access  Private
const createOrder = async (req, res) => {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    const settings = await Settings.findOne();
    const isRazorpayEnabled = settings?.razorpayConfig?.enabled;
    const razorpayKeyId = settings?.razorpayConfig?.keyId;

    if (!isRazorpayEnabled || !razorpayKeyId) {
        res.status(400);
        throw new Error('Razorpay payments are currently disabled or missing configuration.');
    }

    // Initialize dynamic razorpay per order request using DB config
    const dynamicRazorpay = new Razorpay({
        key_id: razorpayKeyId,
        key_secret: getRazorpaySecret()
    });

    const amount = course.price; // Use real price from DB
    const currency = 'INR';

    const options = {
        amount: amount * 100, // amount in smallest currency unit
        currency,
        receipt: `receipt_${Date.now()}`,
    };

    try {
        const order = await dynamicRazorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500);
        throw new Error('Failed to create payment order');
    }
};

// @desc    Verify Payment
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', getRazorpaySecret())
        .update(body.toString())
        .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        try {
            // Fetch course to get correct price
            const course = await Course.findById(courseId);
            if (!course) {
                res.status(404);
                throw new Error('Course not found during verification');
            }

            // 1. Save Payment to DB
            const payment = new Payment({
                user: req.user._id,
                course: courseId,
                amount: course.price,
                transactionId: razorpay_payment_id,
                status: 'completed',
                paymentMethod: 'Razorpay'
            });

            // 2. Enroll User
            const user = await User.findById(req.user._id);
            if (user && !user.enrolledCourses.includes(courseId)) {
                user.enrolledCourses.push(courseId);
                await user.save();
            }

            await payment.save();

            res.json({
                message: 'Payment success',
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id
            });
        } catch (error) {
            console.error('[Payment] verifyPayment failed:', error?.message);
            res.status(500).json({ message: 'Payment recording failed' });
        }

    } else {
        res.status(400);
        throw new Error('Payment verification failed');
    }
};

// @desc    Get all payments (Admin)
// @route   GET /api/payments/admin/all
// @access  Private/Admin
const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find({})
            .populate('user', 'name email')
            .populate('course', 'title')
            .sort({ createdAt: -1 });

        console.log(`[AdminFetch] Payments found: ${payments?.length || 0}`);
        res.json(payments || []);
    } catch (error) {
        console.error(`[AdminFetch Error] Failed to fetch payments:`, error);
        // Return empty array instead of error to keep frontend loading
        res.json([]);
    }
};

// @desc    Get current user payments
// @route   GET /api/payments/my-payments
// @access  Private
const getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user._id })
            .populate('course', 'title thumbnail price')
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch your payments', error: error.message });
    }
};

export { createOrder, verifyPayment, getAllPayments, getMyPayments, getRazorpayConfig };
