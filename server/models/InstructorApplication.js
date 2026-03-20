import mongoose from 'mongoose';

const instructorApplicationSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    fullName: {
        type: String,
        required: true,
    },
    experience: {
        type: String,
        required: true,
    },
    expertise: {
        type: String,
        required: true,
    },
    biography: {
        type: String,
        required: true,
    },
    portfolio: {
        type: String, // URL
    },
    category: {
        type: String,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    rejectionReason: {
        type: String,
    },
    resume: {
        type: String, // Filename only
    }
}, {
    timestamps: true,
});

const InstructorApplication = mongoose.model('InstructorApplication', instructorApplicationSchema);

export default InstructorApplication;
