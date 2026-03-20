import { useState, useEffect } from 'react';
import {
    Star,
    Trash2,
    BookOpen,
    User,
    Calendar,
    MessageSquare,
    Search,
    RefreshCw,
    Award,
    Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminEmptyState from '../../components/AdminEmptyState';
import { useAuth } from '../../context/AuthContext';

const AdminReviews = () => {
    const { api } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/courses/all/reviews');
            setReviews(data || []);
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
            if (!err.response || err.response.status >= 500) {
                toast.error('Server error while loading reviews');
            }
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this student feedback?')) return;
        try {
            await api.delete(`/courses/reviews/${id}`);
            toast.success('Feedback redacted');
            fetchReviews();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Deletion failed');
        }
    };

    const filteredReviews = reviews.filter(rev =>
        rev.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rev.course?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rev.comment.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && reviews.length === 0) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="admin-page-container">
            <header className="admin-page-header">
                <h1 className="admin-page-title">Reviews</h1>
                <div className="header-actions">
                    <button className="btn btn-outline btn-compact" onClick={fetchReviews}>
                        <RefreshCw size={14} /> Refresh
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
                                placeholder="Search by student, course, or content..."
                                className="form-control"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {filteredReviews.length === 0 ? (
                    <AdminEmptyState
                        icon={MessageSquare}
                        title="No feedback found"
                        message={searchTerm ? `No results for "${searchTerm}"` : "The platform course library hasn't received any reviews yet."}
                        onRefresh={fetchReviews}
                    />
                ) : (
                    <div className="table-container">
                        <table className="admin-table responsive-table-stack">
                            <thead>
                                <tr>
                                    <th>Learner</th>
                                    <th>Asset Source</th>
                                    <th>Sentiment</th>
                                    <th>Verbatim Comment</th>
                                    <th>Published</th>
                                    <th style={{ textAlign: 'right' }}>Management</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReviews.map(rev => (
                                    <tr key={rev._id}>
                                        <td data-label="Learner">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                                                    {rev.user?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div style={{ fontWeight: 700, color: 'var(--text)' }}>{rev.user?.name || 'Anonymous Learner'}</div>
                                            </div>
                                        </td>
                                        <td data-label="Asset Source">
                                            <div style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                                {rev.course?.title || 'Unknown Course'}
                                            </div>
                                        </td>
                                        <td data-label="Sentiment">
                                            <div style={{ display: 'flex', gap: '2px' }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={14}
                                                        fill={i < rev.rating ? "#f59e0b" : "none"}
                                                        color={i < rev.rating ? "#f59e0b" : "#cbd5e1"}
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td data-label="Verbatim Comment">
                                            <div
                                                title={rev.comment}
                                                style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'wrap', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', fontSize: '0.85rem', color: 'var(--text-secondary)' }}
                                            >
                                                {rev.comment}
                                            </div>
                                        </td>
                                        <td data-label="Published">
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Calendar size={12} />
                                                {new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td data-label="Management" style={{ textAlign: 'right' }}>
                                            <button
                                                className="admin-action-btn danger"
                                                onClick={() => handleDelete(rev._id)}
                                                title="Redact Review"
                                            >
                                                <Trash2 size={16} />
                                            </button>
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

export default AdminReviews;
