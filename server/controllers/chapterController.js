import Chapter from '../models/Chapter.js';
import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';

// @desc    Get chapters for a course
// @route   GET /api/chapters/:courseId
// @access  Public
const getChapters = async (req, res) => {
    try {
        const chapters = await Chapter.find({ course: req.params.courseId }).sort('order');
        const chaptersWithLessons = await Promise.all(chapters.map(async (chapter) => {
            const lessons = await Lesson.find({ chapter: chapter._id }).sort('order');
            return { ...chapter._doc, lessons };
        }));
        res.json(chaptersWithLessons);
    } catch (error) {
        res.status(500);
        throw new Error('Error fetching chapters');
    }
};

// @desc    Create a chapter
// @route   POST /api/chapters
// @access  Private/Admin
const createChapter = async (req, res) => {
    const { courseId, title, order } = req.body;
    try {
        const chapter = new Chapter({
            course: courseId,
            title,
            order
        });
        const createdChapter = await chapter.save();
        res.status(201).json(createdChapter);
    } catch (error) {
        res.status(400);
        throw new Error('Invalid chapter data');
    }
};

// @desc    Create a lesson
// @route   POST /api/chapters/lesson
// @access  Private/Admin
const createLesson = async (req, res) => {
    const { chapterId, title, duration, order } = req.body;
    try {
        let videoUrl = req.body.videoUrl;
        if (req.file) {
            videoUrl = req.file.path;
        }

        const lesson = new Lesson({
            chapter: chapterId,
            title,
            videoUrl,
            duration,
            order
        });
        const createdLesson = await lesson.save();
        res.status(201).json(createdLesson);
    } catch (error) {
        res.status(400);
        throw new Error('Invalid lesson data');
    }
};

// @desc    Update a chapter
// @route   PUT /api/chapters/:id
// @access  Private/Admin
const updateChapter = async (req, res) => {
    const { title, order } = req.body;
    try {
        const chapter = await Chapter.findById(req.params.id);
        if (!chapter) {
            res.status(404);
            throw new Error('Chapter not found');
        }
        chapter.title = title || chapter.title;
        chapter.order = order !== undefined ? order : chapter.order;
        const updatedChapter = await chapter.save();
        res.json(updatedChapter);
    } catch (error) {
        res.status(400);
        throw new Error('Failed to update chapter');
    }
};

// @desc    Delete a chapter
// @route   DELETE /api/chapters/:id
// @access  Private/Admin
const deleteChapter = async (req, res) => {
    try {
        const chapter = await Chapter.findById(req.params.id);
        if (!chapter) {
            res.status(404);
            throw new Error('Chapter not found');
        }
        // Delete all lessons in this chapter
        await Lesson.deleteMany({ chapter: req.params.id });
        await chapter.deleteOne();
        res.json({ message: 'Chapter deleted' });
    } catch (error) {
        res.status(500);
        throw new Error('Failed to delete chapter');
    }
};

// @desc    Update a lesson
// @route   PUT /api/chapters/lesson/:id
// @access  Private/Admin
const updateLesson = async (req, res) => {
    const { title, duration, order } = req.body;
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) {
            res.status(404);
            throw new Error('Lesson not found');
        }

        let videoUrl = req.body.videoUrl || lesson.videoUrl;
        if (req.file) {
            videoUrl = req.file.path;
        }

        lesson.title = title || lesson.title;
        lesson.videoUrl = videoUrl;
        lesson.duration = duration || lesson.duration;
        lesson.order = order !== undefined ? order : lesson.order;
        const updatedLesson = await lesson.save();
        res.json(updatedLesson);
    } catch (error) {
        res.status(400);
        throw new Error('Failed to update lesson');
    }
};

// @desc    Delete a lesson
// @route   DELETE /api/chapters/lesson/:id
// @access  Private/Admin
const deleteLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) {
            res.status(404);
            throw new Error('Lesson not found');
        }
        await lesson.deleteOne();
        res.json({ message: 'Lesson deleted' });
    } catch (error) {
        res.status(500);
        throw new Error('Failed to delete lesson');
    }
};

export { getChapters, createChapter, updateChapter, deleteChapter, createLesson, updateLesson, deleteLesson };
