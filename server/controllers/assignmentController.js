import Assignment from '../models/Assignment.js';
import Course from '../models/Course.js';

// @desc    Create new assignment
// @route   POST /api/instructor/assignments
// @access  Private/Instructor
export const createAssignment = async (req, res, next) => {
    try {
        const { courseId, title, description, dueDate } = req.body;

        // Verify course belongs to instructor
        const course = await Course.findOne({ _id: courseId, instructor: req.user._id });
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found or unauthorized' });
        }

        const assignment = await Assignment.create({
            course: courseId,
            instructor: req.user._id,
            title,
            description,
            dueDate
        });

        // Fetch updated course data
        const updatedCourse = await Course.findById(courseId).populate('students', 'name email');

        res.status(201).json({
            success: true,
            data: assignment,
            course: updatedCourse
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all instructor assignments
// @route   GET /api/instructor/assignments
// @access  Private/Instructor
export const getAssignments = async (req, res, next) => {
    try {
        const query = { instructor: req.user._id };
        if (req.query.courseId) {
            query.course = req.query.courseId;
        }

        const assignments = await Assignment.find(query)
            .populate('course', 'title')
            .populate('submissions.student', 'name email profileImage')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: assignments });
    } catch (error) {
        next(error);
    }
};

// @desc    Update assignment
// @route   PUT /api/instructor/assignments/:id
// @access  Private/Instructor
export const updateAssignment = async (req, res, next) => {
    try {
        let assignment = await Assignment.findOne({ _id: req.params.id, instructor: req.user._id });
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        const { title, description, dueDate } = req.body;
        assignment.title = title || assignment.title;
        assignment.description = description || assignment.description;
        assignment.dueDate = dueDate || assignment.dueDate;

        await assignment.save();
        res.json({ success: true, data: assignment });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete assignment
// @route   DELETE /api/instructor/assignments/:id
// @access  Private/Instructor
export const deleteAssignment = async (req, res, next) => {
    try {
        const assignment = await Assignment.findOne({ _id: req.params.id, instructor: req.user._id });
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }
        await assignment.deleteOne();
        res.json({ success: true, message: 'Assignment removed' });
    } catch (error) {
        next(error);
    }
};

// @desc    Grade a student submission
// @route   PUT /api/instructor/assignments/:id/grade/:studentId
// @access  Private/Instructor
export const gradeSubmission = async (req, res, next) => {
    try {
        const assignment = await Assignment.findOne({ _id: req.params.id, instructor: req.user._id });
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        const { grade, feedback } = req.body;

        const submission = assignment.submissions.find(sub => String(sub.student) === String(req.params.studentId));
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        submission.grade = grade;
        submission.feedback = feedback;
        submission.status = 'graded';

        await assignment.save();
        res.json({ success: true, message: 'Submission graded successfully', data: assignment });
    } catch (error) {
        next(error);
    }
};
