import mongoose from 'mongoose';

const lessonSchema = mongoose.Schema({
    chapter: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Chapter'
    },
    title: {
        type: String,
        required: true
    },
    videoUrl: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // in minutes
        default: 0
    },
    order: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const Lesson = mongoose.model('Lesson', lessonSchema);
export default Lesson;
