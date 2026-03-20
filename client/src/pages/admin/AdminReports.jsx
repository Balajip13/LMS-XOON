import { useState, useEffect } from 'react';
import {
    Download,
    FileText,
    BarChart2,
    AlertCircle,
    RefreshCw,
    File,
    TrendingUp,
    Users,
    BookOpen,
    CreditCard,
    ChevronRight,
    Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const AdminReports = () => {
    const { api } = useAuth();
    const [stats, setStats] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exportStatus, setExportStatus] = useState({ loading: false, type: null });
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [statsRes, enrollmentsRes, paymentsRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/enrollments/all'),
                api.get('/payments/admin/all')
            ]);
            setStats(statsRes.data);
            setEnrollments(enrollmentsRes.data || []);
            setPayments(paymentsRes.data || []);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError(err.response?.data?.message || 'Failed to load platform intelligence');
            if (!err.response || err.response.status >= 500) {
                toast.error('Intelligence sync failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchAllData();
            toast.success("Intelligence synced successfully");
        } finally {
            setRefreshing(false);
        }
    };

    const handleExport = async (module, format) => {
        const endpointMap = {
            enrollment: 'enrollments',
            revenue: 'payments',
            intelligence: 'reports'
        };

        const moduleName = endpointMap[module];

        try {
            setExportStatus({ loading: true, type: module });
            toast.loading(`Preparing ${format.toUpperCase()} export...`, { id: 'export-toast' });

            const response = await api.get(`/admin/${moduleName}/export?format=${format}`, {
                responseType: 'blob'
            });

            const fileName = `${module}_report_${new Date().getTime()}.${format}`;
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            toast.success(`${format.toUpperCase()} Exported successfully`, { id: 'export-toast' });
        } catch (err) {
            console.error('Export failed:', err);
            toast.error('Failed to export data', { id: 'export-toast' });
        } finally {
            setExportStatus({ loading: false, type: null });
        }
    };

    const hasData = (type) => {
        if (type === 'enrollment') return enrollments && enrollments.length > 0;
        if (type === 'revenue') return payments && payments.length > 0;
        if (type === 'intelligence') return stats !== null;
        return false;
    };

    if (loading && !stats) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="admin-page-container">
            <header className="admin-page-header">
                <h1 className="admin-page-title">Reports</h1>
                <div className="header-actions">
                    <button
                        className="btn btn-outline btn-compact"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button className="btn btn-primary btn-compact" onClick={() => handleExport('intelligence', 'pdf')}>
                        <FileText size={14} /> Export Intelligence
                    </button>
                </div>
            </header>

            {error && (
                <div className="admin-section-card" style={{ borderLeft: '4px solid var(--error)' }}>
                    <div className="flex items-center gap-3">
                        <AlertCircle className="text-error" />
                        <div>
                            <h3 style={{ fontWeight: 700, margin: 0 }}>Sync Error</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon" style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}>
                        <Users size={24} />
                    </div>
                    <div className="metric-info">
                        <p>Registered Learners</p>
                        <h3>{stats?.totalUsers || 0}</h3>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon" style={{ backgroundColor: '#fff7ed', color: '#c2410c' }}>
                        <BookOpen size={24} />
                    </div>
                    <div className="metric-info">
                        <p>Active Curriculums</p>
                        <h3>{stats?.coursesCount || 0}</h3>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                        <CreditCard size={24} />
                    </div>
                    <div className="metric-info">
                        <p>Total Revenue</p>
                        <h3>₹{stats?.totalRevenue?.toLocaleString() || 0}</h3>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon" style={{ backgroundColor: '#fdf2f8', color: '#db2777' }}>
                        <BarChart2 size={24} />
                    </div>
                    <div className="metric-info">
                        <p>Total Enrollments</p>
                        <h3>{stats?.subscriptionsCount || 0}</h3>
                    </div>
                </div>
            </div>

            <div className="admin-grid-2" style={{ marginTop: '2.5rem' }}>
                <div className="admin-section-card">
                    <style>{`
                        .audit-card {
                            padding: 1.5rem;
                            background: var(--surface-hover);
                            border-radius: 16px;
                            border: 1px solid var(--border);
                            transition: all 0.2s ease;
                        }
                        .audit-card-header {
                            display: flex;
                            align-items: flex-start;
                            justify-content: space-between;
                            margin-bottom: 1.25rem;
                            gap: 1rem;
                        }
                        .audit-card-info {
                            display: flex;
                            align-items: center;
                            gap: 1rem;
                        }
                        .audit-card-icon {
                            padding: 0.6rem;
                            border-radius: 10px;
                            background: var(--surface);
                            border: 1px solid var(--border);
                            flex-shrink: 0;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        .audit-card-text {
                            display: flex;
                            flex-direction: column;
                        }
                        .audit-card-title {
                            font-weight: 800;
                            color: var(--text);
                            line-height: 1.4;
                            margin-bottom: 0.25rem;
                        }
                        .audit-card-desc {
                            font-size: 0.75rem;
                            color: var(--text-muted);
                            line-height: 1.4;
                        }
                        .audit-card-stats {
                            text-align: right;
                            flex-shrink: 0;
                        }
                        .audit-card-count {
                            font-weight: 800;
                            font-size: 1.1rem;
                            color: var(--text);
                            line-height: 1.2;
                        }
                        .audit-card-label {
                            font-size: 0.65rem;
                            font-weight: 700;
                            color: var(--text-muted);
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            margin-top: 0.2rem;
                        }
                        .audit-card-actions {
                            display: flex;
                            gap: 0.75rem;
                        }
                        .audit-card-actions > button {
                            flex: 1;
                        }
                        
                        @media (max-width: 768px) {
                            .audit-card-header {
                                flex-direction: column;
                                align-items: flex-start;
                                gap: 1rem;
                                margin-bottom: 1.25rem;
                            }
                            .audit-card-info {
                                flex-direction: column;
                                align-items: flex-start;
                                gap: 0.75rem;
                            }
                            .audit-card-stats {
                                text-align: left;
                                margin-top: 0.25rem;
                            }
                        }
                    `}</style>
                    <div className="flex items-center gap-3 mb-6">
                        <FileText size={20} style={{ color: 'var(--primary)' }} />
                        <h2 className="admin-section-title" style={{ margin: 0 }}>Audit Exports</h2>
                    </div>

                    <div style={{ display: 'grid', gap: '1.25rem' }}>
                        {/* Enrollment Report Card */}
                        <div className="audit-card hover:border-slate-400">
                            <div className="audit-card-header">
                                <div className="audit-card-info">
                                    <div className="audit-card-icon">
                                        <Users size={20} style={{ color: '#6366f1' }} />
                                    </div>
                                    <div className="audit-card-text">
                                        <div className="audit-card-title">Learner Enrollment Audit</div>
                                        <div className="audit-card-desc">Complete student-course mappings and progress</div>
                                    </div>
                                </div>
                                <div className="audit-card-stats">
                                    <div className="audit-card-count">{enrollments.length}</div>
                                    <div className="audit-card-label">Records</div>
                                </div>
                            </div>

                            <div className="audit-card-actions">
                                <button
                                    onClick={() => handleExport('enrollment', 'pdf')}
                                    className="btn btn-primary btn-compact"
                                    disabled={!hasData('enrollment') || exportStatus.loading}
                                >
                                    <File size={16} /> PDF
                                </button>
                                <button
                                    onClick={() => handleExport('enrollment', 'csv')}
                                    className="btn btn-outline btn-compact"
                                    disabled={!hasData('enrollment') || exportStatus.loading}
                                >
                                    <Download size={16} /> CSV
                                </button>
                            </div>
                        </div>

                        {/* Revenue Report Card */}
                        <div className="audit-card hover:border-slate-400">
                            <div className="audit-card-header">
                                <div className="audit-card-info">
                                    <div className="audit-card-icon">
                                        <TrendingUp size={20} style={{ color: '#10b981' }} />
                                    </div>
                                    <div className="audit-card-text">
                                        <div className="audit-card-title">Financial Transaction Ledger</div>
                                        <div className="audit-card-desc">Complete revenue audit and payment logs</div>
                                    </div>
                                </div>
                                <div className="audit-card-stats">
                                    <div className="audit-card-count">{payments.length}</div>
                                    <div className="audit-card-label">Events</div>
                                </div>
                            </div>

                            <div className="audit-card-actions">
                                <button
                                    onClick={() => handleExport('revenue', 'pdf')}
                                    className="btn btn-primary btn-compact"
                                    disabled={!hasData('revenue') || exportStatus.loading}
                                >
                                    <File size={16} /> PDF
                                </button>
                                <button
                                    onClick={() => handleExport('revenue', 'csv')}
                                    className="btn btn-outline btn-compact"
                                    disabled={!hasData('revenue') || exportStatus.loading}
                                >
                                    <Download size={16} /> CSV
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="admin-section-card">
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
                        <h2 className="admin-section-title" style={{ margin: 0 }}>Platform Insights</h2>
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
                            <div className="flex justify-between items-center mb-2">
                                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Total Registered Users</span>
                                <span className="status-badge active" style={{ fontSize: '0.65rem' }}>LIVE</span>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>{stats?.totalUsers || 0}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                {stats?.totalStudents || 0} students · {stats?.totalInstructors || 0} instructors
                            </div>
                        </div>

                        <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
                            <div className="flex justify-between items-center mb-2">
                                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Total Enrollments</span>
                                <span className="status-badge active" style={{ fontSize: '0.65rem' }}>LIVE</span>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>{enrollments.length}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                {enrollments.filter(e => e.isCompleted).length} completed · {enrollments.filter(e => !e.isCompleted).length} in progress
                            </div>
                        </div>

                        <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
                            <div className="flex justify-between items-center mb-2">
                                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Total Revenue</span>
                                <span className="status-badge active" style={{ fontSize: '0.65rem' }}>LIVE</span>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>
                                ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                From {payments.filter(p => p.status === 'completed').length} completed transactions
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
