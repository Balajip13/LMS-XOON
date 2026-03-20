import express from 'express';
import { getSettings, updateSetting } from '../controllers/settingsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/', protect, authorize('admin'), updateSetting);

export default router;
