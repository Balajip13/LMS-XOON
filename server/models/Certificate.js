import mongoose from 'mongoose';

const CertificateSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    certificateId: {
        type: String,
        required: true,
        unique: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    studentName: {
        type: String,
        required: true
    },
    courseTitle: {
        type: String,
        required: true
    },
    instructorName: {
        type: String
    }
}, {
    timestamps: true
});

// Index for quick lookup
CertificateSchema.index({ student: 1, course: 1 }, { unique: true });

const Certificate = mongoose.model('Certificate', CertificateSchema);
export default Certificate;
