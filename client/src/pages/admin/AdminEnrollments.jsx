import { useState, useEffect } from 'react';
import {
    BookOpen,
    User,
    Calendar,
    CheckCircle,
    Clock,
    Inbox,
    Search,
    RefreshCw,
    TrendingUp,
    Download,
    FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminEmptyState from '../../components/AdminEmptyState';
import { useAuth } from '../../context/AuthContext';

const AdminEnrollments = () => {
    const { api } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/enrollments/all');
            setEnrollments(data || []);
        } catch (err) {
            console.error('Failed to fetch enrollments:', err);
            if (!err.response || err.response.status >= 500) {
                toast.error('Server error while fetching enrollments');
            }
            setEnrollments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchEnrollments();
            toast.success("Enrollments refreshed successfully");
        } catch (err) {
            toast.error("Failed to refresh enrollments");
        } finally {
            setRefreshing(false);
        }
    };

    const handleExport = async (format) => {
        try {
            toast.loading(`Preparing ${format.toUpperCase()} export...`, { id: 'export-toast' });
            const response = await api.get(`/admin/enrollments/export?format=${format}`, {
                responseType: 'blob'
            });

            const fileName = `enrollments_report_${new Date().getTime()}.${format}`;
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
        }
    };

    const filteredEnrollments = enrollments.filter(enr =>
        enr.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enr.course?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && enrollments.length === 0) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="admin-page-container">
            <header className="admin-page-header">
                <h1 className="admin-page-title">Enrollments</h1>
                <div className="header-actions">
                    <button
                        className="btn btn-outline btn-compact"
                        onClick={handleRefresh}
                        disabled={refreshing || loading}
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </header>

            <div className="admin-section-card">
                <div className="admin-controls-grid">
                    <div className="search-container">
                        <div className="search-bar-container">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by student or course..."
                                className="form-control"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="export-actions">
                        <button
                            className="btn btn-outline btn-compact"
                            onClick={() => handleExport('csv')}
                            disabled={loading || enrollments.length === 0}
                        >
                            <Download size={14} /> CSV
                        </button>
                        <button
                            className="btn btn-outline btn-compact"
                            onClick={() => handleExport('pdf')}
                            disabled={loading || enrollments.length === 0}
                        >
                            <FileText size={14} /> PDF
                        </button>
                    </div>
                </div>

                {filteredEnrollments.length === 0 ? (
                    <AdminEmptyState
                        icon={Inbox}
                        title="No student enrollments available yet"
                        message={searchTerm ? `No records found for "${searchTerm}"` : "Enrollment records will appear here once students enroll in courses."}
                        onRefresh={fetchEnrollments}
                    />
                ) : (
                    <div className="table-container">
                        <table className="admin-table responsive-table-stack">
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>Student Email</th>
                                    <th>Course Title</th>
                                    <th>Instructor</th>
                                    <th>Enrollment Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEnrollments.map(enr => (
                                    <tr key={enr._id}>
                                        <td data-label="Student Name">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <User size={16} style={{ color: 'var(--text-secondary)' }} />
                                                </div>
                                                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{enr.user?.name || '—'}</span>
                                            </div>
                                        </td>
                                        <td data-label="Student Email" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                            {enr.user?.email || '—'}
                                        </td>
                                        <td data-label="Course Title">
                                            <div style={{ fontWeight: 600, color: 'var(--text)' }}>{enr.course?.title || '—'}</div>
                                        </td>
                                        <td data-label="Instructor" style={{ color: 'var(--text-secondary)' }}>
                                            {enr.course?.instructor?.name || '—'}
                                        </td>
                                        <td data-label="Enrollment Date" style={{ color: 'var(--text-muted)' }}>
                                            {enr.createdAt ? new Date(enr.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                        </td>
                                        <td data-label="Status">
                                            <span className={`status-badge ${enr.isCompleted ? 'completed' : 'active'}`}>
                                                {enr.isCompleted ? 'Completed' : 'In Progress'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminEnrollments;
