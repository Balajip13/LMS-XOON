import mongoose from 'mongoose';

const announcementSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
    },
    audienceType: {
        type: String,
        enum: ['all', 'course'],
        default: 'course'
    },
    role: {
        type: String,
        default: 'instructor'
    }
}, {
    timestamps: true,
});

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;
