import User from '../models/User.js';
import Course from '../models/Course.js';
import Settings from '../models/Settings.js';
import Payment from '../models/Payment.js';
import Enrollment from '../models/Enrollment.js';
import InstructorApplication from '../models/InstructorApplication.js';


// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        console.log('[AdminStats] Fetching dashboard statistics...');

        const totalUsers = await User.countDocuments();
        const instructorsCount = await User.countDocuments({ role: 'instructor' });
        const studentsCount = await User.countDocuments({ role: 'student' });
        const totalCourses = await Course.countDocuments();
        const activeEnrollments = await Enrollment.countDocuments();

        const payments = await Payment.find({ status: 'completed' });
        const totalRevenue = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

        // Recent Data
        const recentRegistrations = await User.find().sort({ createdAt: -1 }).limit(5).select('-password');
        const pendingInstructorApprovals = await InstructorApplication.countDocuments({ status: 'pending' });
        const pendingCourseApprovals = await Course.countDocuments({ status: 'pending' });

        // Revenue Chart (Last 12 months) - Safe aggregation
        let revenueData = [];
        try {
            revenueData = await Payment.aggregate([
                { $match: { status: 'completed' } },
                {
                    $group: {
                        _id: {
                            month: { $month: "$createdAt" },
                            year: { $year: "$createdAt" }
                        },
                        revenue: { $sum: "$amount" },
                        date: { $first: "$createdAt" }
                    }
                },
                { $sort: { "date": 1 } },
                { $limit: 12 }
            ]);
        } catch (aggError) {
            console.error('[AdminStats] Revenue aggregation failed:', aggError.message);
            revenueData = [];
        }

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedRevenueData = revenueData.map(item => ({
            name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
            revenue: item.revenue
        }));

        // User Growth (Simplified) - Safe aggregation
        let userGrowthData = [];
        try {
            userGrowthData = await User.aggregate([
                {
                    $group: {
                        _id: {
                            month: { $month: "$createdAt" },
                            year: { $year: "$createdAt" }
                        },
                        count: { $sum: 1 },
                        date: { $first: "$createdAt" }
                    }
                },
                { $sort: { "date": 1 } },
                { $limit: 12 }
            ]);
        } catch (aggError) {
            console.error('[AdminStats] User growth aggregation failed:', aggError.message);
            userGrowthData = [];
        }

        const formattedUserGrowth = userGrowthData.map(item => ({
            name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
            count: item.count
        }));

        console.log('[AdminStats] Stats retrieved successfully:', {
            totalUsers,
            totalStudents: studentsCount,
            totalInstructors: instructorsCount,
            totalCourses,
            totalRevenue
        });

        res.json({
            totalUsers,
            totalStudents: studentsCount,
            totalInstructors: instructorsCount,
            totalCourses,
            totalRevenue,
            activeEnrollments,
            recentRegistrations,
            pendingInstructorApprovals,
            pendingCourseApprovals,
            revenueData: formattedRevenueData,
            userGrowthData: formattedUserGrowth
        });

    } catch (error) {
        console.error('[AdminStats Error] Failed to fetch dashboard stats:', error);
        // Return zeroed stats instead of error to prevent frontend crash
        res.json({
            totalUsers: 0,
            totalStudents: 0,
            totalInstructors: 0,
            totalCourses: 0,
            totalRevenue: 0,
            activeEnrollments: 0,
            recentRegistrations: [],
            pendingInstructorApprovals: 0,
            pendingCourseApprovals: 0,
            revenueData: [],
            userGrowthData: []
        });
    }
};

// @desc    Get System Settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSystemSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            // Return 200 with default values if no document exists
            return res.status(200).json({
                platformName: "XOON LMS",
                commissionPercentage: 10,
                paymentCommissionPercentage: 2,
                maintenanceMode: false,
                defaultCurrency: "INR",
                smtpConfig: {
                    host: "",
                    port: 587,
                    user: "",
                    pass: "",
                    secure: false
                },
                razorpayConfig: {
                    keyId: "",
                    enabled: false
                }
            });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update System Settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSystemSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({});
        }

        const {
            platformName,
            commissionPercentage,
            paymentCommissionPercentage,
            smtpConfig,
            razorpayConfig,
            maintenanceMode,
            defaultCurrency
        } = req.body;

        if (platformName !== undefined) settings.platformName = platformName;
        if (commissionPercentage !== undefined) settings.commissionPercentage = commissionPercentage;
        if (paymentCommissionPercentage !== undefined) settings.paymentCommissionPercentage = paymentCommissionPercentage;
        if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
        if (defaultCurrency !== undefined) settings.defaultCurrency = defaultCurrency;

        if (smtpConfig !== undefined) {
            settings.smtpConfig = {
                host: smtpConfig.host !== undefined ? smtpConfig.host : settings.smtpConfig?.host,
                port: smtpConfig.port !== undefined ? smtpConfig.port : settings.smtpConfig?.port,
                user: smtpConfig.user !== undefined ? smtpConfig.user : settings.smtpConfig?.user,
                pass: smtpConfig.pass !== undefined ? smtpConfig.pass : settings.smtpConfig?.pass,
                secure: smtpConfig.secure !== undefined ? smtpConfig.secure : settings.smtpConfig?.secure
            };
        }

        if (razorpayConfig !== undefined) {
            settings.razorpayConfig = {
                keyId: razorpayConfig.keyId !== undefined ? razorpayConfig.keyId : settings.razorpayConfig?.keyId,
                enabled: razorpayConfig.enabled !== undefined ? razorpayConfig.enabled : settings.razorpayConfig?.enabled
            };
        }

        const updatedSettings = await settings.save();
        res.json(updatedSettings);
    } catch (error) {
        console.error('[UpdateSettings Error]', error);
        res.status(500).json({ message: error.message });
    }
};

export {
    getDashboardStats,
    getSystemSettings,
    updateSystemSettings
};
