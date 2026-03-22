import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import cloudinary from '../config/cloudinary.js';
import InstructorApplication from '../models/InstructorApplication.js';
import User from '../models/User.js';

const uploadResumeToCloudinary = async (file) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        const err = new Error('Resume storage is not configured. Set CLOUDINARY_* environment variables.');
        err.code = 'CLOUDINARY_CONFIG';
        throw err;
    }
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    return cloudinary.uploader.upload(dataUri, {
        folder: 'xoon_lms/resumes',
        resource_type: 'raw',
        use_filename: true,
        unique_filename: true,
    });
};

// @desc    Submit instructor application
// @route   POST /api/instructor/apply
// @access  Private
const submitApplication = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const userId = req.user._id;
        const { fullName, mobile, expertise, experience, biography, reason, portfolio, category } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Resume required' });
        }

        const cloudResult = await uploadResumeToCloudinary(req.file);
        const secureUrl = cloudResult.secure_url;
        const resumeOriginalName = req.file.originalname || 'resume';

        const email = req.user.email;

        const existingApplication = await InstructorApplication.findOne({ userId });

        let applicationDoc;
        if (existingApplication) {
            existingApplication.fullName = fullName || existingApplication.fullName;
            existingApplication.biography = biography ?? existingApplication.biography;
            existingApplication.expertise = expertise ?? existingApplication.expertise;
            existingApplication.experience = experience ?? existingApplication.experience;
            existingApplication.category = category ?? existingApplication.category;
            existingApplication.reason = reason ?? existingApplication.reason;
            existingApplication.portfolio = portfolio ?? existingApplication.portfolio;
            existingApplication.mobile = mobile ?? existingApplication.mobile;
            existingApplication.resume = secureUrl;
            existingApplication.resumeOriginalName = resumeOriginalName;
            existingApplication.status = 'pending';
            await existingApplication.save();
            applicationDoc = existingApplication;
        } else {
            applicationDoc = await InstructorApplication.create({
                userId,
                fullName: fullName || req.user.name,
                mobile: mobile || '',
                biography,
                expertise,
                experience,
                category,
                reason,
                portfolio: portfolio || '',
                resume: secureUrl,
                resumeOriginalName,
                status: 'pending',
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.instructorRequestStatus = 'pending';
        user.rejectionReason = '';
        user.resumeUrl = secureUrl;
        user.instructorApplication = {
            fullName: fullName || user.name,
            email,
            mobile: mobile || user.mobile || '',
            expertise,
            experience,
            biography,
            reason,
            portfolio: portfolio || '',
            category,
            resumeFileName: resumeOriginalName,
            resumeUrl: secureUrl,
        };
        if (mobile) {
            user.mobile = mobile;
        }
        await user.save();

        const applicationPayload = {
            ...applicationDoc.toObject(),
            resumeFileName: applicationDoc.resumeOriginalName || applicationDoc.resume,
        };

        const userFresh = await User.findById(userId).select('-password').lean();

        res.json({
            success: true,
            message: 'Application submitted',
            user: {
                _id: userFresh._id,
                name: userFresh.name,
                email: userFresh.email,
                role: String(userFresh.role || '').trim().toLowerCase(),
                profileImage: userFresh.profileImage,
                instructorRequestStatus: userFresh.instructorRequestStatus,
                instructorApplication: userFresh.instructorApplication,
                resumeUrl: userFresh.resumeUrl,
                mobile: userFresh.mobile,
            },
            data: applicationPayload,
        });
    } catch (error) {
        console.error('[InstructorApplicationSubmitError]', error);
        const status = error.code === 'CLOUDINARY_CONFIG' ? 503 : 500;
        res.status(status).json({
            success: false,
            message: error.message || 'Error submitting application'
        });
    }
};

// @desc    Download Resume File (Protected)
// @route   GET /api/instructor/resume/download/:filename
// @access  Private
const downloadResume = async (req, res) => {
    try {
        const raw = req.params.filename;

        if (!raw) {
            return res.status(400).json({ message: 'Filename or URL is required' });
        }

        const ref = decodeURIComponent(raw);
        if (/^https?:\/\//i.test(ref)) {
            return res.redirect(ref);
        }

        const possiblePaths = [
            path.join(process.cwd(), 'uploads', ref),
            path.join(process.cwd(), 'uploads', 'resumes', ref),
        ];

        let filePath = null;
        for (const possiblePath of possiblePaths) {
            if (fs.existsSync(possiblePath)) {
                filePath = possiblePath;
                break;
            }
        }

        if (!filePath) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.setHeader('Content-Disposition', `attachment; filename="${ref}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        fs.createReadStream(filePath).pipe(res);
    } catch (error) {
        console.error('[DownloadResumeError]', error);
        res.status(500).json({ message: 'Download failed' });
    }
};

// @desc    Serve Resume File for Viewing
// @route   GET /api/instructor/resume/view/:filename
// @access  Public
const serveResume = async (req, res) => {
    try {
        const { filename } = req.params;

        if (!filename) {
            return res.status(400).json({ message: 'Filename or URL is required' });
        }

        const ref = decodeURIComponent(filename);
        if (/^https?:\/\//i.test(ref)) {
            return res.redirect(ref);
        }

        const possiblePaths = [
            path.join(process.cwd(), 'uploads', ref),
            path.join(process.cwd(), 'uploads', 'resumes', ref),
        ];

        let filePath = null;
        for (const possiblePath of possiblePaths) {
            if (fs.existsSync(possiblePath)) {
                filePath = possiblePath;
                break;
            }
        }

        if (!filePath) {
            return res.status(404).json({ message: 'Resume file not found' });
        }

        res.sendFile(path.resolve(filePath));
    } catch (error) {
        console.error('[ServeResumeError]', error);
        res.status(500).json({ message: 'Failed to serve file' });
    }
};

// @desc    Get All Applications
// @route   GET /api/instructor/applications
// @access  Private/Admin
const getAllApplications = async (req, res) => {
    try {
        const applications = await InstructorApplication.find().populate('userId', 'name email profileImage');
        res.json({
            success: true,
            message: 'Applications fetched successfully',
            data: applications
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Pending Applications for Admin
// @route   GET /api/admin/instructor-requests
// @access  Private/Admin
const getPendingApplications = async (req, res) => {
    try {
        const applications = await InstructorApplication.find({ status: 'pending' }).populate('userId', 'name email profileImage');
        
        // Filter out applications where user is null (deleted users)
        const validApplications = applications.filter(app => app.user !== null);
        
        res.json({
            success: true,
            message: 'Pending applications fetched successfully',
            data: validApplications
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Review Application (Approve/Reject)
// @route   PUT /api/instructor/applications/:id/review
// @access  Private/Admin
const reviewApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid Application ID' });
        }

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status. Use approved or rejected.' });
        }

        const application = await InstructorApplication.findById(id);
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        const userId = application.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update Application
        application.status = status;
        application.rejectionReason = status === 'rejected' ? (rejectionReason || '') : '';
        await application.save();

        if (status === 'approved') {
            user.role = 'instructor';
            user.instructorRequestStatus = 'approved';
            user.rejectionReason = '';
        } else {
            // Rejection: keep role as student (do not promote)
            user.instructorRequestStatus = 'rejected';
            user.rejectionReason = rejectionReason || '';
        }
        await user.save();

        res.json({
            success: true,
            message: `Application ${status} successfully`,
            data: application
        });
    } catch (error) {
        console.error('[InstructorReviewError]', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Remove Instructor
// @route   DELETE /api/instructor/:id
// @access  Private/Admin
const removeInstructor = async (req, res) => {
    try {
        const { id } = req.params; // userId

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid User ID' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Demote Role
        user.role = 'student';
        user.instructorRequestStatus = 'none';
        await user.save();

        // Delete Application completely for clean state
        await InstructorApplication.findOneAndDelete({ userId: id });

        res.json({ success: true, message: 'Instructor removed and demoted successfully' });
    } catch (error) {
        console.error('[RemoveInstructorError]', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get My Application Status
// @route   GET /api/instructor/my-application
// @access  Private
const getMyApplication = async (req, res) => {
    try {
        const application = await InstructorApplication.findOne({ userId: req.user._id });

        res.json({
            success: true,
            message: application ? 'Application fetched successfully' : 'No application found',
            data: application
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export {
    submitApplication,
    downloadResume,
    serveResume,
    getAllApplications,
    getPendingApplications,
    reviewApplication,
    getMyApplication,
    removeInstructor
};
