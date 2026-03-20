import Payout from '../models/Payout.js';
import User from '../models/User.js';

// @desc    Get all payouts
// @route   GET /api/payouts
// @access  Private/Admin
const getPayouts = async (req, res) => {
    try {
        const payouts = await Payout.find().populate('instructor', 'name email').sort('-createdAt');
        res.json(payouts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a payout request (Instructor)
// @route   POST /api/payouts
// @access  Private/Instructor
const requestPayout = async (req, res) => {
    const { amount, method } = req.body;
    try {
        // Logic to check instructor balance would go here
        const payout = await Payout.create({
            instructor: req.user._id,
            amount,
            earnings: amount, // simplify for now
            commission: 0,
            method
        });
        res.status(201).json(payout);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update payout status
// @route   PUT /api/payouts/:id/status
// @access  Private/Admin
const updatePayoutStatus = async (req, res) => {
    try {
        const payout = await Payout.findById(req.params.id);
        if (payout) {
            payout.status = req.body.status || payout.status;
            payout.adminNotes = req.body.adminNotes || payout.adminNotes;
            if (req.body.status === 'paid') {
                payout.paymentId = req.body.paymentId || `TXN-${Date.now()}`;
            }
            const updatedPayout = await payout.save();
            res.json(updatedPayout);
        } else {
            res.status(404).json({ message: 'Payout not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getPayouts, requestPayout, updatePayoutStatus };
