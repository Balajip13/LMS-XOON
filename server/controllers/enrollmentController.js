import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import Course from '../models/Course.js';

// @desc    Get all enrollments (Admin)
// @route   GET /api/admin/enrollments
// @access  Private/Admin
export const getAllEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({})
            .populate('user', 'name email')
            .populate({
                path: 'course',
                select: 'title instructor',
                populate: { path: 'instructor', select: 'name' }
            })
            .sort({ createdAt: -1 });

        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch enrollments', error: error.message });
    }
};

// @desc    Enroll in a course for free (Development Bypass)
// @route   POST /api/enrollments/free
// @access  Private
export const freeEnroll = async (req, res) => {
    try {
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({ message: 'Course ID is required' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already enrolled
        if (user.enrolledCourses.includes(courseId)) {
            return res.status(400).json({ message: 'You are already enrolled in this course' });
        }

        // 1. Add course to user's enrolled list
        user.enrolledCourses.push(courseId);
        await user.save();

        // 2. Create an Enrollment record (for admin tracking)
        const enrollment = new Enrollment({
            user: user._id,
            course: courseId,
            progress: 0,
            completedLessons: [],
            isCompleted: false
        });
        await enrollment.save();

        // 3. Create a dummy Payment record (for dashboard stats)
        // We import Payment dynamically or require it if not already imported
        const Payment = (await import('../models/Payment.js')).default;

        const payment = new Payment({
            user: user._id,
            course: courseId,
            amount: 0, // Free bypass
            transactionId: `FREE_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            status: 'completed',
            paymentMethod: 'Free Bypass'
        });
        await payment.save();

        res.status(200).json({
            message: 'Successfully enrolled for free',
            success: true
        });

    } catch (error) {
        console.error('Free enrollment error:', error);
        res.status(500).json({ message: 'Failed to enroll', error: error.message });
    }
};

// @desc    Check if current user is enrolled in a course
// @route   GET /api/enrollments/check/:courseId
// @access  Private
export const checkEnrollment = async (req, res) => {
    const courseId = req.params.courseId || req.params.id;
    try {
        if (!courseId) {
            return res.status(400).json({ isEnrolled: false, message: 'courseId is required' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ isEnrolled: false, message: 'User not found' });
        }

        const isEnrolled = user.enrolledCourses.includes(courseId);

        if (!isEnrolled) {
            console.log(`[checkEnrollment] User ${user._id} is NOT enrolled in courseId: ${courseId}`);
        }

        res.json({ isEnrolled, courseId });
    } catch (error) {
        console.error(`[checkEnrollment] Error verifying enrollment for courseId: ${courseId}`, error);
        res.status(500).json({ isEnrolled: false, message: 'Failed to check enrollment status', error: error.message });
    }
};

// @desc    Get detailed enrollment info (progress, completed lessons)
// @route   GET /api/enrollments/detail/:courseId
// @access  Private
export const getEnrollmentDetail = async (req, res) => {
    try {
        const enrollment = await Enrollment.findOne({
            user: req.user._id,
            course: req.params.courseId
        }).populate('completedLessons');

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        // Calculate total lessons and completed count for consistent frontend display
        const Chapter = (await import('../models/Chapter.js')).default;
        const Lesson = (await import('../models/Lesson.js')).default;

        const chapters = await Chapter.find({ course: req.params.courseId });
        const chapterIds = chapters.map(c => c._id);
        const totalLessons = await Lesson.countDocuments({ chapter: { $in: chapterIds } });
        const completedLessonsCount = enrollment.completedLessons.length;

        res.json({
            ...enrollment.toObject(),
            totalLessons,
            completedLessonsCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch enrollment detail', error: error.message });
    }
};

// @desc    Update time spent watching a course
// @route   POST /api/enrollments/update-time
// @access  Private
export const updateTimeSpent = async (req, res) => {
    try {
        const { courseId, lessonId, secondsWatched } = req.body;

        if (!courseId || !secondsWatched) {
            return res.status(400).json({ message: 'courseId and secondsWatched are required' });
        }

        const enrollment = await Enrollment.findOne({
            user: req.user._id,
            course: courseId
        });

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        enrollment.timeSpent = (enrollment.timeSpent || 0) + secondsWatched;
        if (lessonId) {
            enrollment.lastWatchedLesson = lessonId;
        }

        await enrollment.save();

        res.json({ success: true, timeSpent: enrollment.timeSpent });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update time spent', error: error.message });
    }
};

// @desc    Mark a lesson as completed
// @route   POST /api/enrollments/complete-lesson
// @access  Private
export const completeLesson = async (req, res) => {
    try {
        const { courseId, lessonId } = req.body;

        const enrollment = await Enrollment.findOne({
            user: req.user._id,
            course: courseId
        });

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        // Robust duplicate check - convert all to string for comparison
        const isAlreadyCompleted = enrollment.completedLessons.some(
            id => id.toString() === lessonId.toString()
        );

        if (!isAlreadyCompleted) {
            enrollment.completedLessons.push(lessonId);

            // Calculate total lessons accurately
            const Chapter = (await import('../models/Chapter.js')).default;
            const Lesson = (await import('../models/Lesson.js')).default;

            const chapters = await Chapter.find({ course: courseId });
            const chapterIds = chapters.map(c => c._id);
            const totalLessonsCount = await Lesson.countDocuments({ chapter: { $in: chapterIds } });

            if (totalLessonsCount > 0) {
                // Ensure progress is accurate and capped at 100%
                const completedCount = enrollment.completedLessons.length;
                enrollment.progress = Math.min(Math.round((completedCount / totalLessonsCount) * 100), 100);
            }

            if (enrollment.progress === 100) {
                enrollment.isCompleted = true;
            }

            await enrollment.save();
        }

        // Return stats along with enrollment for real-time frontend update
        const chapters = await (await import('../models/Chapter.js')).default.find({ course: courseId });
        const chapterIds = chapters.map(c => c._id);
        const totalLessons = await (await import('../models/Lesson.js')).default.countDocuments({ chapter: { $in: chapterIds } });

        console.log(`[completeLesson] Course: ${courseId}, Total: ${totalLessons}, Completed: ${enrollment.completedLessons.length}, Progress: ${enrollment.progress}%`);

        res.json({
            success: true,
            enrollment,
            totalLessons,
            completedLessonsCount: enrollment.completedLessons.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to complete lesson', error: error.message });
    }
};

// @desc    Update a lesson's duration from client-side metadata
// @route   POST /api/enrollments/update-lesson-duration
// @access  Private
export const updateLessonDuration = async (req, res) => {
    try {
        const { lessonId, duration } = req.body;
        if (!lessonId || duration === undefined || isNaN(duration) || duration <= 0) {
            return res.status(400).json({ message: 'Valid lessonId and duration are required' });
        }

        const Lesson = (await import('../models/Lesson.js')).default;
        const lesson = await Lesson.findById(lessonId);

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        // Update duration
        lesson.duration = Math.round(duration);
        await lesson.save();

        res.json({ success: true, duration: lesson.duration });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update lesson duration', error: error.message });
    }
};

// @desc    Initiate enrollment (for free courses since payment is not integrated)
// @route   POST /api/enrollments/initiate
// @access  Private
export const initiateEnrollment = async (req, res) => {
    try {
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({ message: 'Course ID is required' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already enrolled
        if (user.enrolledCourses.includes(courseId)) {
            return res.status(400).json({ message: 'You are already enrolled in this course' });
        }

        // Since payment is not integrated, enroll for free
        const enrollment = new Enrollment({
            user: req.user._id,
            course: courseId,
            enrolledAt: new Date(),
            progress: 0,
            isCompleted: false
        });

        await enrollment.save();

        // Add course to user's enrolled courses
        user.enrolledCourses.push(courseId);
        await user.save();

        // Add student to course's enrolledStudents
        course.enrolledStudents.push(req.user._id);
        await course.save();

        res.json({ 
            success: true, 
            message: 'Enrollment successful',
            enrollment 
        });
    } catch (error) {
        console.error('Enrollment initiation error:', error);
        res.status(500).json({ message: 'Failed to enroll', error: error.message });
    }
};
