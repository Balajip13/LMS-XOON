import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Users,
    BookOpen,
    IndianRupee,
    Star,
    TrendingUp,
    FileText,
    Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const InstructorDashboard = () => {
    const { api } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        fetchOverview();
    }, []);

    const fetchOverview = async () => {
        try {
            const { data } = await api.get('/instructor/dashboard/overview');
            if (data.success) setDashboardData(data.data);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !dashboardData) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Loader2 className="animate-spin" size={40} color="var(--primary)" />
            </div>
        );
    }

    const { stats: fetchedStats, recentEnrollments, recentReviews } = dashboardData;

    const stats = [
        { label: 'Total Courses', value: fetchedStats.totalCourses, icon: BookOpen, color: '#3b82f6' },
        { label: 'Total Students', value: fetchedStats.totalStudents, icon: Users, color: '#8b5cf6' },
        { label: 'Total Earnings', value: `₹${fetchedStats.totalEarnings}`, icon: IndianRupee, color: '#10b981' },
        { label: 'Monthly Revenue', value: `₹${fetchedStats.monthlyRevenue}`, icon: TrendingUp, color: '#f59e0b' },
        { label: 'Average Rating', value: fetchedStats.avgRating, icon: Star, sub: `(${fetchedStats.totalReviews} reviews)`, color: '#ec4899' },
        { label: 'Pending Assignments', value: fetchedStats.pendingAssignments, icon: FileText, sub: 'Needs grading', color: '#ef4444' },
    ];

    return (
        <div className="instructor-page">
            {/* Page Header */}
            <div className="instructor-page-header">
                <div>
                    <h1>Dashboard Overview</h1>
                    <p>Welcome back — here's what's happening with your courses today.</p>
                </div>
                <Link
                    to="/instructor/courses/new"
                    className="btn btn-primary"
                    style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
                >
                    + Create New Course
                </Link>
            </div>

            {/* Dashboard Stats */}
            <div className="instructor-stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="instructor-stat-card">
                        <div className="stat-info">
                            <p className="instructor-stat-label">{stat.label}</p>
                            <h3 className="instructor-stat-value">{stat.value}</h3>
                            {stat.sub && <span className="instructor-stat-sub">{stat.sub}</span>}
                        </div>
                        <div
                            className="instructor-stat-icon"
                            style={{ backgroundColor: `${stat.color}18`, color: stat.color }}
                        >
                            <stat.icon size={22} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Grid for Lists */}
            <div className="instructor-cards-grid">
                {/* Recent Enrollments */}
                <div className="card instructor-section-card">
                    <div className="card-header-flex">
                        <h3 className="section-title">Recent Enrollments</h3>
                        <button
                            className="btn btn-outline btn-compact"
                            onClick={() => navigate('/instructor/students')}
                        >
                            View All
                        </button>
                    </div>
                    <div className="activity-list">
                        {recentEnrollments.length === 0 ? (
                            <div className="empty-state-mini">
                                <p>No recent enrollments yet.</p>
                            </div>
                        ) : recentEnrollments.map((enrollment) => (
                            <div key={enrollment.id} className="activity-item">
                                <div className="activity-avatar">
                                    {enrollment.avatar ? (
                                        <img
                                            src={`${enrollment.avatar.split('?')[0]}?t=${Date.now()}`}
                                            alt={enrollment.student}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    ) : (
                                        enrollment.student.charAt(0)
                                    )}
                                </div>
                                <div className="activity-info">
                                    <h4 className="activity-name">{enrollment.student}</h4>
                                    <p className="activity-desc">
                                        Enrolled in <span className="highlight">{enrollment.course}</span>
                                    </p>
                                </div>
                                <span className="activity-date">
                                    {new Date(enrollment.date).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Reviews */}
                <div className="card instructor-section-card">
                    <div className="card-header-flex">
                        <h3 className="section-title">Recent Reviews</h3>
                        <button
                            className="btn btn-outline btn-compact"
                            onClick={() => navigate('/instructor/reviews')}
                        >
                            View All
                        </button>
                    </div>
                    <div className="review-list">
                        {recentReviews.length === 0 ? (
                            <div className="empty-state-mini">
                                <p>No recent reviews yet.</p>
                            </div>
                        ) : recentReviews.map((review) => (
                            <div key={review.id} className="review-item-compact">
                                <div className="review-header">
                                    <h4 className="review-author">{review.student}</h4>
                                    <div className="review-stars-mini">
                                        <Star size={13} fill="#fbbf24" stroke="#fbbf24" />
                                        <span>{review.rating}</span>
                                    </div>
                                    <span className="review-date-mini">
                                        {new Date(review.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="review-text-mini">"{review.comment}"</p>
                                <p className="review-course-mini">{review.course}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructorDashboard;
