import Course from '../models/Course.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import Chapter from '../models/Chapter.js';
import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';

// @desc    Fetch all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
    const isAdmin = req.user && req.user.role === 'admin';
    const pageSize = isAdmin ? 50 : 12;
    const page = Number(req.query.pageNumber) || 1;

    let query = {};

    // If search keyword provided
    if (req.query.keyword) {
        query.title = { $regex: req.query.keyword, $options: 'i' };
    }

    // Role-based filtering
    if (req.user) {
        if (req.user.role === 'admin') {
            // Admin sees everything (including pending)
        } else if (req.user.role === 'instructor') {
            // Instructors see their own courses
            query.instructor = req.user._id;
        } else {
            // Students/Others see only approved & published
            query.isPublished = true;
            query.status = 'approved';
        }
    } else {
        // If public request (no user), only show approved and published courses
        query.isPublished = true;
        query.status = 'approved';
    }

    const count = await Course.countDocuments(query);
    const courses = await Course.find(query)
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .populate('instructor', 'name')
        .populate('category', 'name')
        .populate('studentCount');

    res.json({ courses, page, pages: Math.ceil(count / pageSize) });
};

// @desc    Fetch single course
// @route   GET /api/courses/:courseId
// @access  Public
const getCourseById = async (req, res) => {
    const courseId = req.params.courseId || req.params.id; // Support both route definitions for safety
    try {
        const course = await Course.findById(courseId);

        if (course) {
            // Fetch Chapters and Lessons
            const chapters = await Chapter.find({ course: course._id }).sort({ order: 1 });

            // Populate lessons for each chapter
            const courseContent = await Promise.all(chapters.map(async (chapter) => {
                const lessons = await Lesson.find({ chapter: chapter._id }).sort({ order: 1 });
                return {
                    ...chapter.toObject(),
                    lessons
                };
            }));

            res.json({
                ...course.toObject(),
                chapters: courseContent
            });
        } else {
            console.error(`[getCourseById] Course not found for courseId: ${courseId}`);
            res.status(404);
            throw new Error('Course not found');
        }
    } catch (error) {
        console.error(`[getCourseById] Failed to load course. Received courseId: ${courseId}`, error);
        res.status(404);
        throw new Error('Course not found');
    }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Admin/Instructor
const createCourse = async (req, res) => {
    const {
        title,
        description,
        price,
        category,
        originalPrice,
        discountPercentage,
        instructorName,
        structure, // JSON string of chapters and lessons
        videoUrl
    } = req.body;

    try {
        let thumbnailPath = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop';

        if (req.file) {
            thumbnailPath = req.file.path;
        }

        const course = new Course({
            title: title || 'New Course',
            instructor: req.user._id,
            instructorName: req.user.name || instructorName,
            thumbnailUrl: thumbnailPath,
            description: description || 'New course description...',
            category: category, // Expecting ObjectId
            price: price || 0,
            originalPrice: originalPrice || price || 0,
            discountPercentage: discountPercentage || 0,
            numReviews: 0,
            rating: 0,
            isPublished: false,
            status: 'pending',
            videoUrl: videoUrl || ''
        });

        const createdCourse = await course.save();
        console.log("Saved course:", createdCourse);

        // Handle curriculum structure if provided
        if (structure) {
            const chaptersData = JSON.parse(structure);
            for (let i = 0; i < chaptersData.length; i++) {
                const chapter = new Chapter({
                    course: createdCourse._id,
                    title: chaptersData[i].title || `Chapter ${i + 1}`,
                    order: i
                });
                const savedChapter = await chapter.save();

                if (chaptersData[i].lessons && chaptersData[i].lessons.length > 0) {
                    for (let j = 0; j < chaptersData[i].lessons.length; j++) {
                        const lesson = new Lesson({
                            chapter: savedChapter._id,
                            title: chaptersData[i].lessons[j].title || `Lesson ${j + 1}`,
                            order: j,
                            videoUrl: chaptersData[i].lessons[j].videoUrl || 'placeholder'
                        });
                        await lesson.save();
                    }
                }
            }
        }

        res.status(201).json({
            success: true,
            message: 'Course created successfully with curriculum. It will be visible once approved.',
            data: createdCourse
        });
    } catch (error) {
        console.error('[CreateCourseError]', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin/Instructor
const updateCourse = async (req, res) => {
    const {
        title,
        description,
        price,
        thumbnail,
        thumbnailUrl,
        category,
        videos,
        isPublished,
        discount,
        videoUrl
    } = req.body;

    const course = await Course.findById(req.params.id);

    if (course) {
        // Authorization check
        if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('You can only update your own courses');
        }
        course.title = title || course.title;
        course.description = description || course.description;
        course.price = price !== undefined ? price : course.price;
        course.originalPrice = req.body.originalPrice !== undefined ? req.body.originalPrice : (course.originalPrice || course.price);
        course.discountPercentage = req.body.discountPercentage !== undefined ? req.body.discountPercentage : (course.discountPercentage || 0);
        course.thumbnailUrl = thumbnailUrl || thumbnail || course.thumbnailUrl;
        course.category = category || course.category;
        course.videos = videos || course.videos;
        course.isPublished = isPublished !== undefined ? isPublished : course.isPublished;
        if (videoUrl !== undefined) {
            course.videoUrl = videoUrl;
        }

        // Admin only fields
        if (req.user.role === 'admin') {
            course.status = req.body.status || course.status;
            course.isFeatured = req.body.isFeatured !== undefined ? req.body.isFeatured : course.isFeatured;

            // If admin sets status to 'approved', automatically publish
            if (req.body.status === 'approved') {
                course.isPublished = true;
            }
        }

        // Smart Sync Pricing:
        const discountAmount = req.body.discount !== undefined ? req.body.discount : (course.discount || 0);
        course.discount = discountAmount;

        // If ANY discount exists, we must ensure originalPrice > price to show strike-through
        if (course.discountPercentage > 0 || course.discount > 0) {
            if (course.originalPrice <= course.price) {
                // If the provided price is meant to be the final one, infer the original price
                const targetPercent = course.discountPercentage > 0 ? course.discountPercentage : 20;
                course.originalPrice = Math.round(course.price / (1 - targetPercent / 100));
            }
        } else if (course.originalPrice > course.price) {
            // Keep them synced if no explicit discount is set, unless originalPrice was manually set higher
            // actually, if originalPrice > price, that IS a discount signal.
        } else {
            course.originalPrice = course.price;
        }

        const updatedCourse = await course.save();
        console.log("Saved course:", updatedCourse);
        res.json(updatedCourse);
    } else {
        res.status(404);
        throw new Error('Course not found');
    }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (course) {
        if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('You can only delete your own courses');
        }
        await course.deleteOne();
        res.json({ message: 'Course removed' });
    } else {
        res.status(404);
        throw new Error('Course not found');
    }
};

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private
const enrollCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);
        const user = await User.findById(req.user._id);

        if (course && user) {
            if (user.enrolledCourses.includes(course._id)) {
                res.status(400);
                throw new Error('Already enrolled');
            }

            user.enrolledCourses.push(course._id);
            await user.save();

            res.json({ message: 'Enrolled successfully' });
        } else {
            res.status(404);
            throw new Error('Course not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/courses/all/reviews
// @access  Private/Admin
const getAllReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find()
            .populate('user', 'name email')
            .populate('course', 'title')
            .sort('-createdAt');
        res.json(reviews);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a review (Admin)
// @route   DELETE /api/courses/reviews/:id
// @access  Private/Admin
const deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            res.status(404);
            throw new Error('Review not found');
        }

        // Also update course rating
        const course = await Course.findById(review.course);
        if (course) {
            course.numReviews -= 1;
            const remainingReviews = await Review.find({ course: course._id, _id: { $ne: review._id } });
            if (remainingReviews.length > 0) {
                const avg = remainingReviews.reduce((acc, item) => item.rating + acc, 0) / remainingReviews.length;
                course.rating = avg;
            } else {
                course.rating = 0;
            }
            await course.save();
        }

        await review.deleteOne();
        res.json({ message: 'Review deleted' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get enrolled courses for a student
// @route   GET /api/courses/enrolled
// @access  Private
const getEnrolledCourses = async (req, res, next) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Primary source of truth: Enrollment documents (filtered by logged-in user)
        console.log('[getEnrolledCourses] User ID:', req.user._id);
        const enrollments = await Enrollment.find({ user: req.user._id })
            .populate({
                path: 'course',
                populate: [
                    { path: 'instructor', select: 'name profilePic' },
                    { path: 'category', select: 'name' }
                ]
            })
            .sort({ updatedAt: -1 });

        const coursesFromEnrollments = (enrollments || [])
            .filter(e => e && e.course)
            .map(e => ({
                ...(e.course.toObject ? e.course.toObject() : e.course),
                enrollmentId: e._id,
                progress: e.progress || 0,
                isCompleted: !!e.isCompleted,
                updatedAt: e.updatedAt || e.course.updatedAt,
            }));

        // Fallback (legacy): if Enrollment docs are missing, use user's enrolledCourses array
        if (coursesFromEnrollments.length === 0) {
            const user = await User.findById(req.user._id).populate({
                path: 'enrolledCourses',
                populate: [
                    { path: 'instructor', select: 'name profilePic' },
                    { path: 'category', select: 'name' }
                ]
            });

            const fallbackCourses = (user?.enrolledCourses || []).map(course => ({
                ...(course.toObject ? course.toObject() : course),
                enrollmentId: `fallback-${course._id}`,
                progress: 0,
                isCompleted: false,
                updatedAt: course.updatedAt,
            }));

            console.log('[getEnrolledCourses] Enrollment fallback count:', fallbackCourses.length);
            return res.json({ success: true, courses: fallbackCourses });
        }

        console.log('[getEnrolledCourses] Enrolled courses count:', coursesFromEnrollments.length);
        return res.json({ success: true, courses: coursesFromEnrollments });
    } catch (error) {
        console.error('[getEnrolledCourses] Error:', error.message);
        next(error);
    }
};

export {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollCourse,
    getEnrolledCourses,
    getAllReviews,
    deleteReview
};
