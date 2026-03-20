import Newsletter from '../models/Newsletter.js';

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter
// @access  Public
const subscribe = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Please provide an email');
    }

    // Check if already subscribed
    const exists = await Newsletter.findOne({ email });

    if (exists) {
        return res.status(200).json({ success: false, message: 'Email is already subscribed to the newsletter.' });
    }

    try {
        await Newsletter.create({ email });
        res.status(201).json({ success: true, message: 'Subscribed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500);
        throw new Error('Subscription failed');
    }
};

export { subscribe };
