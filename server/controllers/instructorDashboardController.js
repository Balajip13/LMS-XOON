import mongoose from 'mongoose';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import Payment from '../models/Payment.js';
import Review from '../models/Review.js';
import Assignment from '../models/Assignment.js';

// @desc    Get Instructor Dashboard Overview Stats
// @route   GET /api/instructor/dashboard/overview
// @access  Private/Instructor
export const getDashboardOverview = async (req, res, next) => {
    try {
        const instructorId = req.user._id;

        // Find all courses by this instructor
        const instructorCourses = await Course.find({ instructor: instructorId }).select('_id title');
        const courseIds = instructorCourses.map(c => c._id);

        if (courseIds.length === 0) {
            return res.json({
                success: true,
                data: {
                    stats: {
                        totalCourses: 0,
                        totalStudents: 0,
                        totalEarnings: 0,
                        monthlyRevenue: 0,
                        avgRating: 0,
                        totalReviews: 0,
                        pendingAssignments: 0
                    },
                    recentEnrollments: [],
                    recentReviews: []
                }
            });
        }

        // 1. Core Stats via Aggregation (Earnings & Revenue)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const paymentStats = await Payment.aggregate([
            { $match: { course: { $in: courseIds }, status: 'completed' } },
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: "$amount" },
                    monthlyRevenue: {
                        $sum: {
                            $cond: [{ $gte: ["$createdAt", startOfMonth] }, "$amount", 0]
                        }
                    }
                }
            }
        ]);

        const totalEarnings = paymentStats.length > 0 ? paymentStats[0].totalEarnings : 0;
        const monthlyRevenue = paymentStats.length > 0 ? paymentStats[0].monthlyRevenue : 0;

        // 2. Total Students Count
        const totalStudents = await Enrollment.countDocuments({ course: { $in: courseIds } });

        // 3. Average Rating
        const reviewStats = await Review.aggregate([
            { $match: { course: { $in: courseIds } } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        const avgRating = reviewStats.length > 0 ? reviewStats[0].avgRating.toFixed(1) : 0;
        const totalReviews = reviewStats.length > 0 ? reviewStats[0].totalReviews : 0;

        // 4. Pending Assignments
        const assignments = await Assignment.find({ instructor: instructorId });
        let pendingAssignments = 0;
        assignments.forEach(a => {
            if (a.submissions) {
                pendingAssignments += a.submissions.filter(sub => sub.status === 'pending').length;
            }
        });

        // 5. Recent Enrollments
        const recentEnrollments = await Enrollment.find({ course: { $in: courseIds } })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name profileImage')
            .populate('course', 'title');

        // 6. Recent Reviews
        const recentReviews = await Review.find({ course: { $in: courseIds } })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name profileImage')
            .populate('course', 'title');

        res.json({
            success: true,
            data: {
                stats: {
                    totalCourses: instructorCourses.length,
                    totalStudents,
                    totalEarnings,
                    monthlyRevenue,
                    avgRating: Number(avgRating),
                    totalReviews,
                    pendingAssignments
                },
                recentEnrollments: recentEnrollments.map(e => ({
                    id: e._id,
                    student: e.user?.name || 'Unknown',
                    course: e.course?.title || 'Unknown',
                    date: e.createdAt,
                    avatar: e.user?.profileImage
                })),
                recentReviews: recentReviews.map(r => ({
                    id: r._id,
                    student: r.user?.name || 'Unknown',
                    course: r.course?.title || 'Unknown',
                    rating: r.rating,
                    comment: r.comment,
                    date: r.createdAt,
                    avatar: r.user?.profileImage
                }))
            }
        });

    } catch (error) {
        console.error('[InstructorOverviewError]', error);
        next(error);
    }
};

// @desc    Get All Students for Instructor
// @route   GET /api/instructor/students
// @access  Private/Instructor
export const getInstructorStudents = async (req, res, next) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.pageNumber) || 1;
        const instructorId = req.user._id;
        const { keyword, courseId } = req.query;

        // 1. Get all courses for this instructor (for the filter dropdown)
        const instructorCourses = await Course.find({ instructor: instructorId }).select('_id title');
        let instructorCourseIds = instructorCourses.map(c => c._id);

        if (instructorCourseIds.length === 0) {
            return res.json({
                success: true,
                data: [],
                courses: [],
                page: 1,
                pages: 0,
                totalStudents: 0
            });
        }

        // 2. Build Base Match Query
        let matchQuery = { course: { $in: instructorCourseIds } };
        if (courseId) {
            matchQuery.course = new mongoose.Types.ObjectId(courseId);
        }

        // 3. Aggregation Pipeline for Filtering and Pagination
        const pipeline = [
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'studentData'
                }
            },
            { $unwind: '$studentData' },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'courseData'
                }
            },
            { $unwind: '$courseData' }
        ];

        // 4. Keyword Search on Student Name or Email
        if (keyword) {
            pipeline.push({
                $match: {
                    $or: [
                        { 'studentData.name': { $regex: keyword, $options: 'i' } },
                        { 'studentData.email': { $regex: keyword, $options: 'i' } }
                    ]
                }
            });
        }

        // 5. Calculate Total Count for Pagination
        const countPipeline = [...pipeline, { $count: 'total' }];
        const countResult = await Enrollment.aggregate(countPipeline);
        const total = countResult.length > 0 ? countResult[0].total : 0;

        // 6. Final Results with Pagination and Sorting
        pipeline.push(
            { $sort: { createdAt: -1 } },
            { $skip: pageSize * (page - 1) },
            { $limit: pageSize }
        );

        const enrollments = await Enrollment.aggregate(pipeline);

        res.json({
            success: true,
            data: enrollments.map(e => ({
                id: e.studentData._id,
                name: e.studentData.name,
                email: e.studentData.email,
                avatar: e.studentData.profileImage,
                course: e.courseData.title,
                enrollmentDate: e.createdAt,
                progress: e.progress,
                isCompleted: e.isCompleted
            })),
            courses: instructorCourses,
            page,
            pages: Math.ceil(total / pageSize),
            totalStudents: total
        });

    } catch (error) {
        console.error('[InstructorStudentsError]', error);
        next(error);
    }
};

// @desc    Get Instructor Earnings & Payment History
// @route   GET /api/instructor/earnings
// @access  Private/Instructor
export const getInstructorEarnings = async (req, res, next) => {
    try {
        const instructorId = req.user._id;
        const { month } = req.query; // e.g. "2024-02"

        const courses = await Course.find({ instructor: instructorId }).select('_id title');
        const courseIds = courses.map(c => c._id);

        if (courseIds.length === 0) {
            return res.json({ success: true, data: { totalRevenue: 0, paymentHistory: [], chartData: { monthly: [], byCourse: [] } } });
        }

        let query = { course: { $in: courseIds }, status: 'completed' };

        if (month) {
            const [year, m] = month.split('-');
            const start = new Date(year, parseInt(m) - 1, 1);
            const end = new Date(year, parseInt(m), 0, 23, 59, 59);
            query.createdAt = { $gte: start, $lte: end };
        }

        const payments = await Payment.find(query)
            .populate('user', 'name')
            .populate('course', 'title')
            .sort({ createdAt: -1 });

        const totalRevenue = payments.reduce((acc, pay) => acc + pay.amount, 0);

        // All-time grouping for charts (always show last 6 months even if filtered, or show context)
        const allPayments = await Payment.find({ course: { $in: courseIds }, status: 'completed' });

        const revenueByMonth = {};
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
            revenueByMonth[key] = 0;
        }

        const revenueByCourse = {};
        allPayments.forEach(pay => {
            const key = new Date(pay.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
            if (revenueByMonth[key] !== undefined) {
                revenueByMonth[key] += pay.amount;
            }
        });

        courses.forEach(c => {
            const courseRevenue = allPayments.filter(p => String(p.course) === String(c._id)).reduce((acc, p) => acc + p.amount, 0);
            if (courseRevenue > 0) revenueByCourse[c.title] = courseRevenue;
        });

        res.json({
            success: true,
            data: {
                totalRevenue,
                paymentHistory: payments.map(p => ({
                    id: p._id,
                    student: p.user?.name || 'Unknown',
                    course: p.course?.title || 'Unknown',
                    amount: p.amount,
                    date: p.createdAt,
                    transactionId: p.transactionId
                })),
                chartData: {
                    monthly: Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue })),
                    byCourse: Object.entries(revenueByCourse).map(([course, revenue]) => ({ course, revenue }))
                }
            }
        });
    } catch (error) {
        console.error('[InstructorEarningsError]', error);
        next(error);
    }
};

// @desc    Get Instructor Reviews
// @route   GET /api/instructor/reviews
// @access  Private/Instructor
export const getInstructorReviews = async (req, res, next) => {
    try {
        const instructorId = req.user._id;
        const courses = await Course.find({ instructor: instructorId }).select('_id title');
        const courseIds = courses.map(c => c._id);

        if (courseIds.length === 0) {
            return res.json({ success: true, data: { totalReviews: 0, avgRating: 0, ratingDistribution: {}, reviews: [] } });
        }

        const reviews = await Review.find({ course: { $in: courseIds } })
            .populate('user', 'name profileImage')
            .populate('course', 'title')
            .sort({ createdAt: -1 });

        const totalReviews = reviews.length;
        const avgRating = totalReviews > 0
            ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / totalReviews).toFixed(1)
            : 0;

        // Group by rating
        const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            if (ratingDistribution[r.rating] !== undefined) {
                ratingDistribution[r.rating]++;
            }
        });

        res.json({
            success: true,
            data: {
                totalReviews,
                avgRating: Number(avgRating),
                ratingDistribution,
                reviews: reviews.map(r => ({
                    id: r._id,
                    student: r.user?.name || 'Unknown Student',
                    avatar: r.user?.profileImage,
                    course: r.course?.title || 'Deleted Course',
                    rating: r.rating,
                    comment: r.comment,
                    date: r.createdAt
                }))
            }
        });
    } catch (error) {
        console.error('[InstructorReviewsError]', error);
        next(error);
    }
};

// @desc    Get Instructor Reports & Analytics
// @route   GET /api/instructor/reports
// @access  Private/Instructor
export const getInstructorReports = async (req, res, next) => {
    try {
        const instructorId = req.user._id;
        const courses = await Course.find({ instructor: instructorId }).select('_id title rating numReviews');
        const courseIds = courses.map(c => c._id);

        if (courseIds.length === 0) {
            return res.json({
                success: true,
                data: {
                    revenueTrend: [],
                    studentGrowth: [],
                    coursePerformance: []
                }
            });
        }

        // 1. Revenue Trend (Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyRevenue = await Payment.aggregate([
            { $match: { course: { $in: courseIds }, status: 'completed', createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$amount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 2. Student Growth (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);

        const enrollments = await Enrollment.aggregate([
            { $match: { course: { $in: courseIds }, createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // 3. Course Performance Stats
        const coursePerformance = await Promise.all(courses.map(async (course) => {
            const studentCount = await Enrollment.countDocuments({ course: course._id });
            const revenueResult = await Payment.aggregate([
                { $match: { course: course._id, status: 'completed' } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);

            return {
                title: course.title,
                students: studentCount,
                revenue: revenueResult.length > 0 ? revenueResult[0].total : 0,
                rating: course.rating || 0,
                reviews: course.numReviews || 0
            };
        }));

        res.json({
            success: true,
            data: {
                revenueTrend: dailyRevenue.map(d => ({ date: d._id, revenue: d.revenue })),
                studentGrowth: enrollments.map(e => ({
                    month: new Date(e._id.year, e._id.month - 1).toLocaleString('default', { month: 'short' }),
                    count: e.count
                })),
                coursePerformance
            }
        });

    } catch (error) {
        console.error('[InstructorReportsError]', error);
        next(error);
    }
};
