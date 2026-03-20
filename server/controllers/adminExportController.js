import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Payment from '../models/Payment.js';
import InstructorApplication from '../models/InstructorApplication.js';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit-table';

// Helper to format currency in Indian style
const formatCurrency = (amount) => {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
};

// Helper to send CSV
const sendCSV = (res, data, fields, filename) => {
    try {
        const json2csvParser = new Parser({ fields });
        // Handle empty data
        const csv = data.length > 0 ? json2csvParser.parse(data) : fields.join(',');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        console.log(`[Export] Sending CSV: ${filename}.csv, Records: ${data.length}`);
        return res.status(200).send(csv);
    } catch (error) {
        console.error(`[Export Error] CSV generation failed for ${filename}:`, error);
        return res.status(500).json({ message: 'CSV Generation Failed' });
    }
};

// Helper to send PDF
const sendPDF = async (res, title, headers, rows, filename) => {
    try {
        const doc = new PDFDocument({ margin: 30, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);

        doc.pipe(res);

        doc.fontSize(20).text('XOON LMS PLATFORM', { align: 'center' });
        doc.fontSize(14).text(title, { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Generated On: ${new Date().toLocaleString()}`, { align: 'right' });
        doc.moveDown();

        const table = {
            title: title,
            headers: headers.map(h => ({ label: h, property: h, width: 100 })), // Basic header config
            rows: rows,
        };

        // Note: pdfkit-table's table method is sync or returns a promise depending on version
        // We'll use it carefully.
        await doc.table(table, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
            prepareRow: (row, index, column, rect, rectRow) => doc.font("Helvetica").fontSize(8),
        });

        console.log(`[Export] Sending PDF: ${filename}.pdf, Records: ${rows.length}`);
        doc.end();
    } catch (error) {
        console.error(`[Export Error] PDF generation failed for ${filename}:`, error);
        // If headers already sent, we can't send JSON
        if (!res.headersSent) {
            return res.status(500).json({ message: 'PDF Generation Failed' });
        }
    }
};

// @desc    Export Users
// @route   GET /api/admin/users/export
const exportUsers = async (req, res) => {
    try {
        const format = req.query.format || 'csv';
        const users = await User.find({}).sort({ createdAt: -1 });

        const data = users.map(u => ({
            Name: u.name,
            Email: u.email,
            Role: u.role,
            Status: u.isBlocked ? 'Blocked' : 'Active',
            Joined: new Date(u.createdAt).toLocaleDateString()
        }));

        if (format === 'pdf') {
            const headers = ['Name', 'Email', 'Role', 'Status', 'Joined'];
            const rows = data.map(d => [d.Name, d.Email, d.Role, d.Status, d.Joined]);
            return await sendPDF(res, 'Users Audit Report', headers, rows, 'users_report');
        }

        const fields = ['Name', 'Email', 'Role', 'Status', 'Joined'];
        sendCSV(res, data, fields, 'users_report');

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export Instructors
// @route   GET /api/admin/instructors/export
const exportInstructors = async (req, res) => {
    try {
        const format = req.query.format || 'csv';
        const tab = req.query.tab || 'approved'; // 'approved' or 'pending'

        console.log(`[Export] Instructors Export - Tab: ${tab}, Format: ${format}`);

        if (tab === 'pending') {
            const applications = await InstructorApplication.find({ status: 'pending' })
                .populate('userId', 'name email')
                .sort({ createdAt: -1 });

            const data = applications.map(app => ({
                Name: app.fullName || app.userId?.name || 'N/A',
                Email: app.userId?.email || 'N/A',
                Expertise: app.expertise || 'N/A',
                Experience: app.experience || 'N/A',
                Category: app.category || 'N/A',
                Status: 'Pending Review',
                Applied: new Date(app.createdAt).toLocaleDateString()
            }));

            if (format === 'pdf') {
                const headers = ['Name', 'Email', 'Expertise', 'Experience', 'Category', 'Applied'];
                const rows = data.map(d => [d.Name, d.Email, d.Expertise, d.Experience, d.Category, d.Applied]);
                return await sendPDF(res, 'Pending Instructor Applications', headers, rows, 'pending_instructors_report');
            }

            const fields = ['Name', 'Email', 'Expertise', 'Experience', 'Category', 'Applied'];
            return sendCSV(res, data, fields, 'pending_instructors_report');
        } else {
            // Approved Instructors - Fetch from Applications to get rich data
            const applications = await InstructorApplication.find({ status: 'approved' })
                .populate('userId', 'name email isBlocked')
                .sort({ createdAt: -1 });

            const data = await Promise.all(applications.map(async (app) => {
                const userId = app.userId?._id || app.userId;
                const coursesCount = await Course.countDocuments({ instructor: userId });

                return {
                    Name: app.fullName || app.userId?.name || 'N/A',
                    Email: app.userId?.email || 'N/A',
                    Expertise: app.expertise || 'N/A',
                    Experience: app.experience || 'N/A',
                    Courses: coursesCount || 0,
                    Status: app.userId?.isBlocked ? 'Blocked' : 'Active'
                };
            }));

            if (format === 'pdf') {
                const headers = ['Name', 'Email', 'Expertise', 'Experience', 'Courses', 'Status'];
                const rows = data.map(d => [d.Name, d.Email, d.Expertise, d.Experience, d.Courses.toString(), d.Status]);
                return await sendPDF(res, 'Verified Instructors Report', headers, rows, 'verified_instructors_report');
            }

            const fields = ['Name', 'Email', 'Expertise', 'Experience', 'Courses', 'Status'];
            return sendCSV(res, data, fields, 'verified_instructors_report');
        }

    } catch (error) {
        console.error('[Export Error] Instructor export failed:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export Enrollments
// @route   GET /api/admin/enrollments/export
const exportEnrollments = async (req, res) => {
    try {
        const format = req.query.format || 'csv';
        const enrollments = await Enrollment.find({})
            .populate('user', 'name email')
            .populate('course', 'title')
            .sort({ createdAt: -1 });

        const data = enrollments.map(e => ({
            Student: e.user?.name || 'N/A',
            Email: e.user?.email || 'N/A',
            Course: e.course?.title || 'N/A',
            Progress: `${e.progress || 0}%`,
            Status: e.isCompleted ? 'Completed' : 'Learning',
            Date: new Date(e.createdAt).toLocaleDateString()
        }));

        if (format === 'pdf') {
            const headers = ['Student', 'Email', 'Course', 'Progress', 'Status', 'Date'];
            const rows = data.map(d => [d.Student, d.Email, d.Course, d.Progress, d.Status, d.Date]);
            return await sendPDF(res, 'Platform Enrollment Audit', headers, rows, 'enrollments_report');
        }

        const fields = ['Student', 'Email', 'Course', 'Progress', 'Status', 'Date'];
        sendCSV(res, data, fields, 'enrollments_report');

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export Payments
// @route   GET /api/admin/payments/export
const exportPayments = async (req, res) => {
    try {
        const format = req.query.format || 'csv';
        const payments = await Payment.find({})
            .populate('user', 'name email')
            .populate('course', 'title')
            .sort({ createdAt: -1 });

        const data = payments.map(p => ({
            TransactionID: p.transactionId,
            Student: p.user?.name || 'N/A',
            Course: p.course?.title || 'N/A',
            Amount: formatCurrency(p.amount),
            Status: p.status,
            Date: new Date(p.createdAt).toLocaleDateString()
        }));

        if (format === 'pdf') {
            const headers = ['ID', 'Student', 'Course', 'Amount', 'Status', 'Date'];
            const rows = data.map(d => [d.TransactionID, d.Student, d.Course, d.Amount, d.Status, d.Date]);
            return await sendPDF(res, 'Financial Transaction Ledger', headers, rows, 'payments_report');
        }

        const fields = ['TransactionID', 'Student', 'Course', 'Amount', 'Status', 'Date'];
        sendCSV(res, data, fields, 'payments_report');

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export Reports (Stats Summary)
// @route   GET /api/admin/reports/export
const exportReports = async (req, res) => {
    try {
        const format = req.query.format || 'csv';

        // Fetch stats
        const totalUsers = await User.countDocuments();
        const totalCourses = await Course.countDocuments();
        const activeEnrollments = await Enrollment.countDocuments();
        const payments = await Payment.find({ status: 'completed' });
        const totalRevenue = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

        const data = [
            { Metric: 'Total Users', Value: totalUsers, Date: new Date().toLocaleDateString() },
            { Metric: 'Total Courses', Value: totalCourses, Date: new Date().toLocaleDateString() },
            { Metric: 'Active Enrollments', Value: activeEnrollments, Date: new Date().toLocaleDateString() },
            { Metric: 'Total Revenue', Value: formatCurrency(totalRevenue), Date: new Date().toLocaleDateString() }
        ];

        if (format === 'pdf') {
            const headers = ['Metric', 'Value', 'Generated Date'];
            const rows = data.map(d => [d.Metric, d.Value.toString(), d.Date]);
            return await sendPDF(res, 'System Intelligence Summary', headers, rows, 'intelligence_report');
        }

        const fields = ['Metric', 'Value', 'Date'];
        sendCSV(res, data, fields, 'intelligence_report');

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    exportUsers,
    exportInstructors,
    exportEnrollments,
    exportPayments,
    exportReports
};
