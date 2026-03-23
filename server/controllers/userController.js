import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Settings from '../models/Settings.js';
import InstructorApplication from '../models/InstructorApplication.js';
import sendWelcomeEmail from '../utils/sendEmail.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Generate JWT Token
const generateToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return token;
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required',
            error: 'MISSING_CREDENTIALS'
        });
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');
    let isMatch = false;

    console.log("Login email:", email);
    console.log("User found:", user);

    if (user) {
        try {
            isMatch = await bcrypt.compare(password, user.password);
        } catch (error) {
            console.error('[Auth] Password compare error:', error?.message);
        }
    }

    console.log("Password match:", isMatch);

    if (!user || !isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if user is blocked
    if (user.isBlocked) {
        return res.status(403).json({
            success: false,
            message: 'Your account is blocked. Please contact support.',
            error: 'ACCOUNT_BLOCKED'
        });
    }

    // Check for Maintenance Mode (except for Admins)
    const settings = await Settings.findOne();
    const roleNorm = String(user.role || '').trim().toLowerCase();
    if (settings?.maintenanceMode && roleNorm !== 'admin') {
        return res.status(503).json({
            success: false,
            message: 'System is under maintenance. Please try again later.',
            error: 'MAINTENANCE_MODE'
        });
    }

    // Generate token and send response
    const token = generateToken(res, user._id);
    
    res.status(200).json({
        success: true,
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: roleNorm,
            profilePic: user.profilePic,
            isInstructor: user.isInstructor,
            isBlocked: user.isBlocked,
            status: user.status,
            instructorRequestStatus: user.instructorRequestStatus,
            instructorApplication: user.instructorApplication,
            rejectionReason: user.rejectionReason,
            resumeUrl: user.resumeUrl,
            mobile: user.mobile,
        }
    });
});

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide all required fields',
            error: 'MISSING_FIELDS'
        });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address',
            error: 'INVALID_EMAIL'
        });
    }

    // Strong password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
            error: 'WEAK_PASSWORD'
        });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({
            success: false,
            message: 'User already exists with this email',
            error: 'USER_EXISTS'
        });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'student'
    });

    if (!user) {
        return res.status(500).json({
            success: false,
            message: 'Failed to create user',
            error: 'USER_CREATION_FAILED'
        });
    }

    // Send welcome email (async, don't wait for it)
    sendWelcomeEmail(user.email, user.name).catch(error => {
        console.error('Failed to send welcome email:', error);
    });

    // Return success response WITHOUT token
    res.status(201).json({
        success: true,
        message: 'User created successfully. Please login to continue.',
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: String(user.role || '').trim().toLowerCase(),
            instructorRequestStatus: user.instructorRequestStatus
        }
    });
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
        secure: true,
        sameSite: 'none',
    });
    
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate('enrolledCourses', 'title thumbnail instructor');

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
            error: 'USER_NOT_FOUND'
        });
    }

    res.status(200).json({
        success: true,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: String(user.role || '').trim().toLowerCase(),
            profilePic: user.profilePic,
            bio: user.bio,
            notificationSettings: user.notificationSettings,
            enrolledCourses: user.enrolledCourses,
            isInstructor: user.isInstructor,
            isBlocked: user.isBlocked,
            status: user.status,
            instructorRequestStatus: user.instructorRequestStatus,
            instructorApplication: user.instructorApplication,
            rejectionReason: user.rejectionReason,
            resumeUrl: user.resumeUrl,
            mobile: user.mobile,
            createdAt: user.createdAt
        }
    });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
            error: 'USER_NOT_FOUND'
        });
    }

    const { name, email, bio, mobile, linkedin } = req.body;

    // Validate email if provided
    if (email && email !== user.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address',
                error: 'INVALID_EMAIL'
            });
        }

        // Check if email is already taken
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists',
                error: 'EMAIL_EXISTS'
            });
        }
    }

    // Update fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.bio = bio !== undefined ? bio : user.bio;
    user.mobile = mobile !== undefined ? mobile : user.mobile;
    user.linkedin = linkedin !== undefined ? linkedin : user.linkedin;

    const updatedUser = await user.save();

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            profilePic: updatedUser.profilePic,
            bio: updatedUser.bio,
            mobile: updatedUser.mobile,
            linkedin: updatedUser.linkedin,
            notificationSettings: updatedUser.notificationSettings,
            isInstructor: updatedUser.isInstructor,
            isBlocked: updatedUser.isBlocked,
            status: updatedUser.status,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt
        }
    });
});

// @desc    Update notification settings
// @route   PUT /api/users/notification-settings
// @access  Private
const updateNotificationSettings = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
            error: 'USER_NOT_FOUND'
        });
    }

    user.notificationSettings = {
        ...user.notificationSettings,
        ...req.body
    };

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Notification settings updated successfully',
        notificationSettings: user.notificationSettings
    });
});

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Current password and new password are required',
            error: 'MISSING_PASSWORDS'
        });
    }

    // Strong password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
            error: 'WEAK_PASSWORD'
        });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
            error: 'USER_NOT_FOUND'
        });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.matchPassword(currentPassword);
    if (!isCurrentPasswordValid) {
        return res.status(400).json({
            success: false,
            message: 'Current password is incorrect',
            error: 'INVALID_CURRENT_PASSWORD'
        });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password changed successfully'
    });
});

// @desc    Upload user avatar
// @route   POST /api/users/profile/avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
            error: 'USER_NOT_FOUND'
        });
    }

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded',
            error: 'NO_FILE_UPLOADED'
        });
    }

    user.profilePic = req.file.path;
    await user.save();

    console.log("Uploaded avatar URL:", user.profilePic);

    res.status(200).json({
        success: true,
        message: 'Avatar uploaded successfully',
        profilePic: user.profilePic
    });
});

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const role = req.query.role || '';

    const query = {};
    
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    if (role) {
        query.role = role;
    }

    const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
        success: true,
        users,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// @desc    Update user status (Admin)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
    const { isBlocked } = req.body;

    if (typeof isBlocked !== 'boolean') {
        return res.status(400).json({
            success: false,
            message: 'isBlocked must be a boolean value',
            error: 'INVALID_STATUS'
        });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
            error: 'USER_NOT_FOUND'
        });
    }

    user.isBlocked = isBlocked;
    user.status = isBlocked ? 'suspended' : 'active';
    await user.save();

    res.status(200).json({
        success: true,
        message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isBlocked: user.isBlocked,
            status: user.status
        }
    });
});

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
            error: 'USER_NOT_FOUND'
        });
    }

    // Delete associated instructor applications
    await InstructorApplication.deleteMany({ userId: req.params.id });
    
    await user.deleteOne();

    res.status(200).json({
        success: true,
        message: 'User deleted successfully'
    });
});

// @desc    Get user enrollments
// @route   GET /api/users/enrollments
// @access  Private
const getUserEnrollments = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate({
            path: 'enrolledCourses',
            populate: [
                { path: 'instructor', select: 'name profilePic' },
                { path: 'category', select: 'name' }
            ]
        });

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
            error: 'USER_NOT_FOUND'
        });
    }

    res.status(200).json({
        success: true,
        enrollments: user.enrolledCourses
    });
});

export {
    loginUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    updateNotificationSettings,
    changePassword,
    uploadAvatar,
    getAllUsers,
    updateUserStatus,
    deleteUser,
    getUserEnrollments
};
