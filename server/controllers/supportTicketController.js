import SupportTicket from '../models/SupportTicket.js';

// @desc    Get all tickets (Admin)
// @route   GET /api/tickets
// @access  Private/Admin
const getTickets = async (req, res) => {
    try {
        const status = req.query.status;
        const query = status ? { status } : {};
        const tickets = await SupportTicket.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = async (req, res) => {
    try {
        const { subject, message, priority } = req.body;
        const ticket = await SupportTicket.create({
            user: req.user._id,
            subject,
            message,
            priority
        });
        res.status(201).json(ticket);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Add response to ticket
// @route   POST /api/tickets/:id/response
// @access  Private
const replyToTicket = async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id);
        if (ticket) {
            ticket.responses.push({
                user: req.user._id,
                message: req.body.message
            });

            // If admin replies, set to in-progress
            if (req.user.role === 'admin') {
                ticket.status = 'in-progress';
            }

            await ticket.save();
            res.json(ticket);
        } else {
            res.status(404);
            throw new Error('Ticket not found');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update ticket status
// @route   PUT /api/tickets/:id/status
// @access  Private/Admin
const updateTicketStatus = async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id);
        if (ticket) {
            ticket.status = req.body.status || ticket.status;
            await ticket.save();
            res.json(ticket);
        } else {
            res.status(404);
            throw new Error('Ticket not found');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export {
    getTickets,
    createTicket,
    replyToTicket,
    updateTicketStatus
};
