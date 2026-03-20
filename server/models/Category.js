import mongoose from 'mongoose';

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String
    },
    image: {
        type: String
    },
    courseCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
