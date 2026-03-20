import express from 'express';
import { getChapters, createChapter, updateChapter, deleteChapter, createLesson, updateLesson, deleteLesson } from '../controllers/chapterController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import courseUpload from '../middleware/courseUpload.js';

const router = express.Router();

router.get('/:courseId', getChapters);
router.post('/', protect, authorize('admin', 'instructor'), createChapter);
router.put('/:id', protect, authorize('admin', 'instructor'), updateChapter);
router.delete('/:id', protect, authorize('admin', 'instructor'), deleteChapter);
router.post('/lesson', protect, authorize('admin', 'instructor'), courseUpload.single('video'), createLesson);
router.put('/lesson/:id', protect, authorize('admin', 'instructor'), courseUpload.single('video'), updateLesson);
router.delete('/lesson/:id', protect, authorize('admin', 'instructor'), deleteLesson);

export default router;
