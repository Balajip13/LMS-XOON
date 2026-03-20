import mongoose from 'mongoose';

const courseSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    instructorName: { // Storing name for quick display
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    originalPrice: {
        type: Number,
        default: function () { return this.price; }
    },
    discountPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    discount: {
        type: Number,
        default: 0,
    },
    thumbnail: {
        type: String, // URL
        required: true,
    },
    previewVideo: {
        type: String, // YouTube URL or similar
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        default: 0,
    },
    numReviews: {
        type: Number,
        required: true,
        default: 0,
    },
    videos: [{
        title: String,
        duration: String,
        isFree: {
            type: Boolean,
            default: false
        }
    }],
    isPublished: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'rejected'],
        default: 'draft'
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    learningOutcomes: [{
        type: String
    }],
    requirements: [{
        type: String
    }],
    includes: [{
        type: String
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field for calculated final price
courseSchema.virtual('finalPrice').get(function () {
    if (this.discountPercentage > 0) {
        return Math.round(this.originalPrice * (1 - this.discountPercentage / 100));
    }
    if (this.discount > 0) {
        return Math.max(0, this.originalPrice - this.discount);
    }
    return this.price;
});

// Virtual for student count
courseSchema.virtual('studentCount', {
    ref: 'Enrollment',
    localField: '_id',
    foreignField: 'course',
    count: true
});

// Virtual for enrolled students
courseSchema.virtual('students', {
    ref: 'Enrollment',
    localField: '_id',
    foreignField: 'course'
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
