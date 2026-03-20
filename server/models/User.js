import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['student', 'instructor', 'admin'],
        default: 'student',
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'suspended'],
        default: 'active'
    },
    enrolledCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    settings: {
        maintenanceMode: { type: Boolean, default: false },
        allowRegistrations: { type: Boolean, default: true }
    },
    // Additional fields for student/teacher profile
    profileImage: {
        type: String,
        default: '',
    },
    bio: {
        type: String,
        default: '',
    },
    notificationSettings: {
        email: { type: Boolean, default: true },
        platform: { type: Boolean, default: true }
    },
    // For certificates
    dob: {
        type: Date,
    },
    mobile: {
        type: String,
    },
    linkedin: {
        type: String,
        default: '',
    },
    instructorRequestStatus: {
        type: String,
        enum: ['none', 'pending', 'approved', 'rejected'],
        default: 'none'
    },
    rejectionReason: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
});

// Middleware to hash password before saving
userSchema.pre('save', async function () {
    if (!this.password || !this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) {
        return false;
    }
    
    try {
        return await bcrypt.compare(enteredPassword, this.password);
    } catch (error) {
        console.error('[Auth] bcrypt.compare failed:', error?.message);
        return false;
    }
};

const User = mongoose.model('User', userSchema);

export default User;
