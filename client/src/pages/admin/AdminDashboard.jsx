import { useEffect, useState } from 'react';
import { Users, BookOpen, IndianRupee, TrendingUp, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { api } = useAuth();
    const [stats, setStats] = useState({
        usersCount: 0,
        totalUsers: 0,
        totalStudents: 0,
        totalInstructors: 0,
        totalCourses: 0,
        activeEnrollments: 0,
        totalRevenue: 0,
        revenueData: [],
        userGrowthData: [],
        pendingInstructorApprovals: 0,
        pendingCourseApprovals: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboardData = async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        else setRefreshing(true);

        try {
            const { data } = await api.get('/admin/stats');
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
            toast.error("Failed to load dashboard statistics");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleRefresh = () => {
        fetchDashboardData(true).then(() => {
            toast.success("Dashboard metrics updated");
        });
    };

    if (loading && !refreshing) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const MetricCard = ({ title, value, icon: Icon, color }) => (
        <div className="metric-card">
            <div className="metric-icon" style={{ backgroundColor: `${color}15`, color: color }}>
                <Icon size={24} />
            </div>
            <div className="metric-info">
                <p>{title}</p>
                <h3>{value}</h3>
            </div>
        </div>
    );

    return (
        <div className="admin-page-container dashboard-container">
            <header className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Dashboard</h1>
                    <p className="admin-page-subtitle">Platform overview and performance metrics</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-outline btn-compact"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? 'Syncing...' : 'Sync Data'}
                    </button>
                </div>
            </header>

            <div className="admin-dashboard-alerts">
                {stats.pendingInstructorApprovals > 0 && (
                    <Link to="/admin/instructors" className="dashboard-alert status-warning">
                        {stats.pendingInstructorApprovals} Pending Instructor Approvals
                    </Link>
                )}
                {stats.pendingCourseApprovals > 0 && (
                    <Link to="/admin/courses" className="dashboard-alert status-success">
                        {stats.pendingCourseApprovals} Courses Awaiting Review
                    </Link>
                )}
            </div>

            <div className="metrics-grid">
                <MetricCard title="Total Users" value={stats.totalUsers || 0} icon={Users} color="#6366f1" />
                <MetricCard title="Active Enrollments" value={stats.activeEnrollments || 0} icon={TrendingUp} color="#f59e0b" />
                <MetricCard title="Total Revenue" value={`₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`} icon={IndianRupee} color="#ef4444" />
                <MetricCard title="Courses" value={stats.totalCourses || 0} icon={BookOpen} color="#10b981" />
            </div>

            <div className="analytics-grid admin-grid-2">
                <div className="analytics-card">
                    <div className="analytics-card-header">
                        <h3>Revenue Growth</h3>
                    </div>
                    <div className="chart-wrapper">
                        {(stats.revenueData || []).length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} dy={10} />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                        tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'var(--surface-hover)' }}
                                        contentStyle={{
                                            backgroundColor: 'var(--surface)',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            boxShadow: 'var(--shadow-lg)',
                                            color: 'var(--text)'
                                        }}
                                        itemStyle={{ color: 'var(--text)' }}
                                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                                    />
                                    <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-state-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                                <IndianRupee size={32} opacity={0.2} />
                                <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>No revenue data available</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="analytics-card">
                    <div className="analytics-card-header">
                        <h3>User Growth</h3>
                    </div>
                    <div className="chart-wrapper">
                        {(stats.userGrowthData || []).length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.userGrowthData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                                    <Tooltip
                                        cursor={{ fill: 'var(--surface-hover)' }}
                                        contentStyle={{
                                            backgroundColor: 'var(--surface)',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            boxShadow: 'var(--shadow-lg)'
                                        }}
                                        itemStyle={{ color: 'var(--text)' }}
                                    />
                                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-state-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                                <Users size={32} opacity={0.2} />
                                <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>No growth data available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
