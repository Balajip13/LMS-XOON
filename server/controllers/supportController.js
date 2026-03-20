import Contact from '../models/Contact.js';
import Newsletter from '../models/Newsletter.js';
import SupportTicket from '../models/SupportTicket.js';

// @desc    Get all contact messages
// @route   GET /api/support/contact
// @access  Private/Admin
const getContacts = async (req, res) => {
    console.log('[SupportController] Fetching contacts...');
    try {
        const contacts = await Contact.find({}).sort({ createdAt: -1 });
        console.log(`[SupportController] Found ${contacts.length} contacts`);
        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500);
        throw new Error('Failed to fetch messages');
    }
};

// @desc    Delete a contact message
// @route   DELETE /api/support/contact/:id
// @access  Private/Admin
const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (contact) {
            await contact.deleteOne();
            res.json({ message: 'Message removed' });
        } else {
            res.status(404);
            throw new Error('Message not found');
        }
    } catch (error) {
        res.status(500);
        throw new Error('Failed to delete message');
    }
};

// @desc    Get all newsletter subscribers
// @route   GET /api/support/newsletter
// @access  Private/Admin
const getSubscribers = async (req, res) => {
    console.log('[SupportController] Fetching subscribers...');
    try {
        const subscribers = await Newsletter.find({}).sort({ createdAt: -1 });
        console.log(`[SupportController] Found ${subscribers.length} subscribers`);
        res.json(subscribers);
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        res.status(500);
        throw new Error('Failed to fetch subscribers');
    }
};

// @desc    Delete a newsletter subscriber
// @route   DELETE /api/support/newsletter/:id
// @access  Private/Admin
const deleteSubscriber = async (req, res) => {
    try {
        const subscriber = await Newsletter.findById(req.params.id);

        if (subscriber) {
            await subscriber.deleteOne();
            res.json({ message: 'Subscriber removed' });
        } else {
            res.status(404);
            throw new Error('Subscriber not found');
        }
    } catch (error) {
        res.status(500);
        throw new Error('Failed to delete subscriber');
    }
};

// @desc    Create a support ticket
// @route   POST /api/support/tickets
// @access  Private
const createSupportTicket = async (req, res) => {
    try {
        const { subject, message, priority } = req.body;

        if (!subject || !message) {
            res.status(400);
            throw new Error('Please provide subject and message');
        }

        const ticket = await SupportTicket.create({
            user: req.user._id,
            subject,
            message,
            priority: priority || 'medium'
        });

        res.status(201).json({
            success: true,
            message: 'Support ticket created successfully',
            ticket
        });
    } catch (error) {
        res.status(500);
        throw new Error(error.message || 'Failed to create support ticket');
    }
};

export {
    getContacts,
    deleteContact,
    getSubscribers,
    deleteSubscriber,
    createSupportTicket
};
