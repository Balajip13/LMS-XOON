import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import InstructorApplication from '../models/InstructorApplication.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Submit instructor application
// @route   POST /api/instructor/apply
// @access  Private
const submitApplication = async (req, res) => {
    try {
        // Get user ID from authenticated user
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const userId = req.user._id;
        const { fullName, email, mobile, expertise, experience, biography, reason, portfolio, category } = req.body;

        // Resume is required
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Resume required' });
        }

        const resumeFile = req.file.filename;

        // Check for existing application
        const existingApplication = await InstructorApplication.findOne({ userId });

        if (existingApplication) {
            // Update existing application
            existingApplication.fullName = fullName;
            existingApplication.email = email;
            existingApplication.biography = biography;
            existingApplication.expertise = expertise;
            existingApplication.experience = experience;
            existingApplication.category = category;
            existingApplication.reason = reason;
            existingApplication.portfolio = portfolio;
            existingApplication.resume = resumeFile;
            existingApplication.status = 'pending';
            await existingApplication.save();
        } else {
            // Create new application
            const application = await InstructorApplication.create({
                user: userId,
                userId,
                fullName,
                email,
                biography,
                expertise,
                experience,
                category,
                reason,
                portfolio,
                resume: resumeFile,
                status: 'pending'
            });
        }

        await User.findByIdAndUpdate(userId, { instructorRequestStatus: 'pending' });

        res.json({
            success: true,
            message: 'Application submitted successfully'
        });
    } catch (error) {
        console.error('[InstructorApplicationSubmitError]', error);
        res.status(500).json({
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
        const fileName = req.params.filename;
        
        if (!fileName) {
            return res.status(400).json({ message: "Filename is required" });
        }
        
        // Check both possible locations
        const possiblePaths = [
            path.join(process.cwd(), "uploads", fileName),
            path.join(process.cwd(), "uploads", "resumes", fileName)
        ];
        
        let filePath = null;
        for (const possiblePath of possiblePaths) {
            console.log("Checking path:", possiblePath);
            if (fs.existsSync(possiblePath)) {
                filePath = possiblePath;
                break;
            }
        }
        
        if (!filePath) {
            console.error('[DownloadResumeError] File not found in any location');
            return res.status(404).json({ message: "File not found" });
        }
        
        console.log("Downloading:", filePath); // Debug log
        
        // Set headers to force download
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        res.setHeader("Content-Type", "application/octet-stream");
        
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
        
    } catch (error) {
        console.error('[DownloadResumeError]', error);
        res.status(500).json({ message: "Download failed" });
    }
};

// @desc    Serve Resume File for Viewing
// @route   GET /api/instructor/resume/view/:filename
// @access  Public
const serveResume = async (req, res) => {
    try {
        const { filename } = req.params;
        
        if (!filename) {
            return res.status(400).json({ message: "Filename is required" });
        }
        
        // Check both possible locations
        const possiblePaths = [
            path.join(process.cwd(), "uploads", filename),
            path.join(process.cwd(), "uploads", "resumes", filename)
        ];
        
        let filePath = null;
        for (const possiblePath of possiblePaths) {
            if (fs.existsSync(possiblePath)) {
                filePath = possiblePath;
                break;
            }
        }
        
        if (!filePath) {
            console.error('[ServeResumeError] File not found in any location');
            return res.status(404).json({ message: "Resume file not found" });
        }
        
        console.log('[ServeResume] Serving file for viewing:', filePath);
        res.sendFile(filePath);
    } catch (error) {
        console.error('[ServeResumeError]', error);
        res.status(500).json({ message: "Failed to serve file" });
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

        // Update User Role & Status
        if (status === 'approved') {
            user.role = 'instructor';
            user.instructorRequestStatus = 'approved';
        } else {
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
