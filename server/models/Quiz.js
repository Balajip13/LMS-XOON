import mongoose from 'mongoose';

const quizSchema = mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Course'
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    questions: [{
        questionText: {
            type: String,
            required: true
        },
        options: [{
            type: String,
            required: true
        }],
        correctAnswerIndex: {
            type: Number,
            required: true
        }
    }],
    attempts: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        score: Number,
        attemptDate: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
