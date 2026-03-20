import express from 'express';
import {
    getContacts,
    deleteContact,
    getSubscribers,
    deleteSubscriber,
    createSupportTicket
} from '../controllers/supportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/contact', protect, authorize('admin'), getContacts);
router.delete('/contact/:id', protect, authorize('admin'), deleteContact);
router.get('/newsletter', protect, authorize('admin'), getSubscribers);
router.delete('/newsletter/:id', protect, authorize('admin'), deleteSubscriber);

router.post('/tickets', protect, createSupportTicket);

export default router;
