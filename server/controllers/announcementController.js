import Announcement from '../models/Announcement.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// @desc    Get announcements for enrolled courses
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = async (req, res) => {
    try {
        // Fetch full user to guarantee enrolledCourses is available
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userEnrolledCourses = user.enrolledCourses || [];

        // 1. Get courses student is enrolled in
        const enrolledCourses = await Course.find({ _id: { $in: userEnrolledCourses } });
        const instructorIds = [...new Set(enrolledCourses.map(c => c.instructor.toString()))];

        // 2. Find announcements that are either:
        //    - Specific to an enrolled course
        //    - Addressed to 'all' students by an instructor of an enrolled course
        const announcements = await Announcement.find({
            $or: [
                { course: { $in: userEnrolledCourses } },
                {
                    audienceType: 'all',
                    instructor: { $in: instructorIds }
                }
            ]
        }).populate('course', 'title').populate('instructor', 'name').select('title message course audienceType instructor createdAt');

        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create an announcement (for testing/instructors)
// @route   POST /api/announcements
// @access  Private/Instructor
const createAnnouncement = async (req, res) => {
    const { title, message, courseId, audienceType } = req.body;

    if (!title || !message) {
        res.status(400);
        throw new Error('Please provide title and message');
    }

    // Validation for course ownership
    if (audienceType === 'course') {
        const course = await Course.findById(courseId);
        if (!course) {
            res.status(404);
            throw new Error('Course not found');
        }
        if (course.instructor.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to post for this course');
        }
    }

    const announcement = await Announcement.create({
        title,
        message,
        course: audienceType === 'course' ? courseId : null,
        audienceType: audienceType || 'course',
        instructor: req.user._id
    });

    if (announcement) {
        res.status(201).json(announcement);
    } else {
        res.status(400);
        throw new Error('Invalid announcement data');
    }
};

// @desc    Get announcements created by instructor
// @route   GET /api/announcements/instructor
// @access  Private/Instructor
const getInstructorAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({ instructor: req.user._id })
            .populate('course', 'title')
            .select('title message course audienceType createdAt')
            .sort({ createdAt: -1 });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Instructor
const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (announcement) {
            if (announcement.instructor.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            await announcement.deleteOne();
            res.json({ message: 'Announcement removed' });
        } else {
            res.status(404).json({ message: 'Announcement not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getAnnouncements, createAnnouncement, getInstructorAnnouncements, deleteAnnouncement };

