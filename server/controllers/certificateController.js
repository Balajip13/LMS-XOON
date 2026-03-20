import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import Certificate from '../models/Certificate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Generate Certificate
// @route   GET /api/certificates/:courseId
// @access  Private
const generateCertificate = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        const user = req.user;

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const enrollment = await Enrollment.findOne({ user: user._id, course: course._id });
        if (!enrollment) {
            return res.status(403).json({ message: 'No enrollment found for this course' });
        }

        if (enrollment.progress < 100) {
            return res.status(403).json({ message: 'Course must be 100% complete to unlock certificate' });
        }

        if (enrollment.bestQuizScore < 70) {
            return res.status(403).json({ message: 'You must pass the quiz with at least 70% to unlock certificate' });
        }

        // Check if certificate already exists
        let certRecord = await Certificate.findOne({ student: user._id, course: course._id });
        if (!certRecord) {
            const shortCourseId = course._id.toString().slice(-4).toUpperCase();
            const shortUserId = user._id.toString().slice(-4).toUpperCase();
            const uniqueId = `XOON-${shortCourseId}-${shortUserId}-${Math.floor(1000 + Math.random() * 9000)}`;

            certRecord = await Certificate.create({
                student: user._id,
                course: course._id,
                certificateId: uniqueId,
                studentName: user.name,
                courseTitle: course.title,
                instructorName: course.instructorName || 'Expert Instructor',
                issueDate: new Date()
            });
        }

        // Create a document - LANDSCAPE A4
        const doc = new PDFDocument({
            layout: 'landscape',
            size: 'A4',
            margin: 0
        });

        const safeStudentName = user.name.replace(/[^a-z0-9]/gi, '_');
        const safeCourseName = course.title.replace(/[^a-z0-9]/gi, '_');
        const filename = `${safeStudentName}-${safeCourseName}-Certificate.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        doc.pipe(res);

        const width = doc.page.width;
        const height = doc.page.height;

        // --- BACKGROUND ---
        doc.rect(0, 0, width, height).fill('#ffffff');
        doc.rect(0, 0, width, height).fillOpacity(0.02).fill('#2563eb');
        doc.fillOpacity(1);

        // --- DECORATIVE BORDERS ---
        // Thin professional border
        doc.rect(20, 20, width - 40, height - 40)
            .lineWidth(1)
            .stroke('#cbd5e1');

        doc.rect(25, 25, width - 50, height - 50)
            .lineWidth(0.5)
            .stroke('#2563eb');

        // --- TOP SECTION ---
        const logoPath = path.join(__dirname, '../../client/public/logo.png');
        try {
            // Larger, centered logo
            doc.image(logoPath, width / 2 - 60, 50, { width: 120 });
        } catch (e) {
            doc.fillColor('#2563eb').fontSize(32).font('Helvetica-Bold').text('XOON LMS', 0, 70, { align: 'center' });
        }

        // Title - Positioned below logo with clear spacing
        doc.fillColor('#1e293b').fontSize(40).font('Times-Bold').text('CERTIFICATE OF COMPLETION', 0, 180, { align: 'center' });

        // --- MIDDLE SECTION ---
        doc.fillColor('#64748b').fontSize(16).font('Helvetica').text('This is to certify that', 0, 240, { align: 'center' });

        doc.fillColor('#1e1b4b').fontSize(50).font('Helvetica-Bold').text(certRecord.studentName, 0, 275, { align: 'center' });

        doc.fillColor('#64748b').fontSize(16).font('Helvetica').text('has successfully completed the course', 0, 345, { align: 'center' });

        doc.fillColor('#1e293b').fontSize(28).font('Helvetica-Bold').text(certRecord.courseTitle.toUpperCase(), 0, 380, { align: 'center' });

        // --- BOTTOM SECTION (3 COLUMNS) ---
        const footerY = height - 140;

        // Left Column: Instructor
        doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text(certRecord.instructorName, 80, footerY, { width: 220, align: 'center' });
        doc.moveTo(80, footerY + 20).lineTo(300, footerY + 20).lineWidth(1).stroke('#1e293b');
        doc.fillColor('#64748b').fontSize(10).font('Helvetica').text('Course Instructor', 80, footerY + 25, { width: 220, align: 'center' });

        // Center Column: Date & ID
        const centerX = width / 2 - 110;
        doc.fillColor('#1e293b').fontSize(12).font('Helvetica-Bold').text(`Date: ${certRecord.issueDate.toLocaleDateString()}`, centerX, footerY + 5, { width: 220, align: 'center' });
        doc.fillColor('#64748b').fontSize(10).font('Helvetica').text(`Certificate ID: ${certRecord.certificateId}`, centerX, footerY + 25, { width: 220, align: 'center' });

        // Right Column: Professional Seal
        const sealX = width - 200;
        const sealY = footerY - 20;

        // Reduced size balanced seal
        doc.circle(sealX + 60, sealY + 40, 35).lineWidth(1.5).stroke('#2563eb');
        doc.circle(sealX + 60, sealY + 40, 32).lineWidth(0.5).stroke('#cbd5e1');

        doc.fillColor('#2563eb').fontSize(10).font('Helvetica-Bold').text('XOON', sealX + 30, sealY + 30, { width: 60, align: 'center' });
        doc.fontSize(8).text('VERIFIED', sealX + 30, sealY + 42, { width: 60, align: 'center' });

        // Elegant ribbons
        doc.moveTo(sealX + 45, sealY + 70).lineTo(sealX + 35, sealY + 95).lineTo(sealX + 55, sealY + 85).lineTo(sealX + 60, sealY + 75).fill('#2563eb');
        doc.moveTo(sealX + 75, sealY + 70).lineTo(sealX + 85, sealY + 95).lineTo(sealX + 65, sealY + 85).lineTo(sealX + 60, sealY + 75).fill('#2563eb');

        doc.end();
    } catch (error) {
        console.error('Certificate generation error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};

// @desc    Get logged-in user's certificates
// @route   GET /api/certificates/my-certificates
// @access  Private
const getMyCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find({ student: req.user._id })
            .sort({ issueDate: -1 });

        res.status(200).json(certificates);
    } catch (error) {
        console.error('Error fetching certificates:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export { generateCertificate, getMyCertificates };
