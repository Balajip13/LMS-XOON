import Quiz from '../models/Quiz.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

// @desc    Create new quiz
// @route   POST /api/instructor/quizzes
// @access  Private/Instructor
export const createQuiz = async (req, res, next) => {
    try {
        const { courseId, title, questions } = req.body;

        const course = await Course.findOne({ _id: courseId, instructor: req.user._id });
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found or unauthorized' });
        }

        const quiz = await Quiz.create({
            course: courseId,
            instructor: req.user._id,
            title,
            questions
        });

        // Fetch updated course data
        const updatedCourse = await Course.findById(courseId).populate('students', 'name email');

        res.status(201).json({
            success: true,
            data: quiz,
            course: updatedCourse
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all instructor quizzes
// @route   GET /api/instructor/quizzes
// @access  Private/Instructor
export const getQuizzes = async (req, res, next) => {
    try {
        const query = { instructor: req.user._id };
        if (req.query.courseId) {
            query.course = req.query.courseId;
        }

        const quizzes = await Quiz.find(query)
            .populate('course', 'title')
            .populate('attempts.student', 'name email profilePic')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: quizzes });
    } catch (error) {
        next(error);
    }
};

// @desc    Update quiz
// @route   PUT /api/instructor/quizzes/:id
// @access  Private/Instructor
export const updateQuiz = async (req, res, next) => {
    try {
        let quiz = await Quiz.findOne({ _id: req.params.id, instructor: req.user._id });
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        const { title, questions } = req.body;
        quiz.title = title || quiz.title;
        quiz.questions = questions || quiz.questions;

        await quiz.save();
        res.json({ success: true, data: quiz });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete quiz
// @route   DELETE /api/instructor/quizzes/:id
// @access  Private/Instructor
export const deleteQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({ _id: req.params.id, instructor: req.user._id });
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }
        await quiz.deleteOne();
        res.json({ success: true, message: 'Quiz removed' });
    } catch (error) {
        next(error);
    }
};
// @desc    Get course quiz for student (without correct answers)
// @route   GET /api/courses/:courseId/quiz
// @access  Private/Student
export const getCourseQuizForStudent = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({ course: req.params.courseId });

        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found for this course' });
        }

        // Return questions without correct answers for the student
        const safeQuestions = quiz.questions.map(q => ({
            _id: q._id,
            questionText: q.questionText,
            options: q.options
        }));

        res.json({
            success: true,
            data: {
                _id: quiz._id,
                title: quiz.title,
                questions: safeQuestions
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Submit quiz attempt
// @route   POST /api/courses/:courseId/quiz/submit
// @access  Private/Student
export const submitQuizAttempt = async (req, res, next) => {
    try {
        const { answers } = req.body; // Array of selected option indices
        const quiz = await Quiz.findOne({ course: req.params.courseId });

        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        const enrollment = await Enrollment.findOne({ user: req.user._id, course: req.params.courseId });
        if (!enrollment) {
            return res.status(403).json({ success: false, message: 'You must be enrolled to take the quiz' });
        }

        if (enrollment.quizAttempts >= 3) {
            return res.status(400).json({ success: false, message: 'Maximum attempts reached (3)' });
        }

        let score = 0;
        quiz.questions.forEach((q, index) => {
            if (answers[index] === q.correctAnswerIndex) {
                score++;
            }
        });

        const percentage = (score / quiz.questions.length) * 100;
        const passed = percentage >= 70;

        // Update enrollment record
        enrollment.quizAttempts += 1;
        if (percentage > (enrollment.bestQuizScore || 0)) {
            enrollment.bestQuizScore = percentage;
        }
        await enrollment.save();

        // Record attempt in Quiz model
        quiz.attempts.push({
            student: req.user._id,
            score: percentage,
            attemptDate: new Date()
        });
        await quiz.save();

        res.json({
            success: true,
            score: percentage,
            passed,
            attemptsUsed: enrollment.quizAttempts,
            bestScore: enrollment.bestQuizScore
        });
    } catch (error) {
        next(error);
    }
};
