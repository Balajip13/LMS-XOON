import Contact from '../models/Contact.js';

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res) => {
    const { name, email, mobile, message } = req.body;

    if (!name || !email || !mobile || !message) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    try {
        const contact = await Contact.create({
            name,
            email,
            mobile,
            message,
        });
        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            contact
        });
    } catch (error) {
        res.status(500);
        throw new Error('Failed to save message');
    }
};

export {
    submitContact,
};
