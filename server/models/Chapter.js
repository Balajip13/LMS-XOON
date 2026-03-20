import mongoose from 'mongoose';

const chapterSchema = mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Course'
    },
    title: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const Chapter = mongoose.model('Chapter', chapterSchema);
export default Chapter;
