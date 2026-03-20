import express from 'express';
const router = express.Router();
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.route('/')
    .get(getCategories)
    .post(protect, authorize('admin'), createCategory);

router.route('/:id')
    .put(protect, authorize('admin'), updateCategory)
    .delete(protect, authorize('admin'), deleteCategory);

export default router;
