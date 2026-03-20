import express from 'express';
const router = express.Router();
import {
    getTickets,
    createTicket,
    replyToTicket,
    updateTicketStatus
} from '../controllers/supportTicketController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.route('/')
    .get(protect, authorize('admin'), getTickets)
    .post(protect, createTicket);

router.route('/:id/response')
    .post(protect, replyToTicket);

router.route('/:id/status')
    .put(protect, authorize('admin'), updateTicketStatus);

export default router;
