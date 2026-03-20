import mongoose from 'mongoose';

const assignmentSchema = mongoose.Schema({
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
    description: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date
    },
    submissions: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        fileUrl: String,
        submittedAt: {
            type: Date,
            default: Date.now
        },
        grade: Number,
        feedback: String,
        status: {
            type: String,
            enum: ['pending', 'graded'],
            default: 'pending'
        }
    }]
}, {
    timestamps: true
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
