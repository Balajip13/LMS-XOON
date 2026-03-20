import express from 'express';
import { generateCertificate, getMyCertificates } from '../controllers/certificateController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-certificates', protect, getMyCertificates);
router.get('/:courseId', protect, generateCertificate);

export default router;
