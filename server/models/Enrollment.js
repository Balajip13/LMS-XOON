import mongoose from 'mongoose';

const enrollmentSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Course'
    },
    progress: {
        type: Number,
        default: 0
    },
    completedLessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    }],
    isCompleted: {
        type: Boolean,
        default: false
    },
    timeSpent: {
        type: Number,
        default: 0
    },
    lastWatchedLesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    },
    bestQuizScore: {
        type: Number,
        default: 0
    },
    quizAttempts: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
export default Enrollment;
