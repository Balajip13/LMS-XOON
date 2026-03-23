import Review from '../models/Review.js';
import Course from '../models/Course.js';

// @desc    Add or update a review (upsert per student per course)
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
    try {
        const { courseId, rating, comment } = req.body;

        if (!courseId || !rating || !comment) {
            return res.status(400).json({ message: 'courseId, rating, and comment are required' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Upsert: update existing review or create a new one
        const existingReview = await Review.findOne({ user: req.user._id, course: courseId });
        let review;
        let isUpdate = false;

        if (existingReview) {
            existingReview.rating = Number(rating);
            existingReview.comment = comment;
            review = await existingReview.save();
            isUpdate = true;
        } else {
            review = await Review.create({
                user: req.user._id,
                course: courseId,
                rating: Number(rating),
                comment
            });
        }

        // Recalculate course average rating
        const allReviews = await Review.find({ course: courseId });
        course.numReviews = allReviews.length;
        course.rating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
        await course.save();

        // Return review with user info populated
        const populated = await Review.findById(review._id).populate('user', 'name profilePic');

        res.status(isUpdate ? 200 : 201).json({
            message: isUpdate ? 'Review updated' : 'Review added',
            review: populated,
            updated: isUpdate
        });
    } catch (error) {
        console.error('createReview error:', error);
        res.status(500).json({ message: 'Error saving review', error: error.message });
    }
};

// @desc    Get course reviews
// @route   GET /api/reviews/course/:courseId
// @access  Public
const getCourseReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ course: req.params.courseId })
            .populate('user', 'name profilePic')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
};

// @desc    Get all reviews (for admin/instructor)
// @route   GET /api/reviews/admin
// @access  Private/Admin
const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find({})
            .populate('user', 'name')
            .populate('course', 'title instructorName')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
};

export { createReview, getCourseReviews, getAllReviews };
