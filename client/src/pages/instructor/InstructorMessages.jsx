import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Plus,
    Trash2,
    Bell,
    Loader2,
    Calendar,
    BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

const InstructorMessages = () => {
    const { api } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const annRes = await api.get('/announcements/instructor');
            setAnnouncements(annRes.data);
        } catch (error) {
            toast.error('Failed to load announcements');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await api.delete(`/announcements/${id}`);
            toast.success('Announcement deleted');
            setAnnouncements(prev => prev.filter(a => a._id !== id));
        } catch (error) {
            toast.error('Failed to delete announcement');
        }
    };

    return (
        <div className="instructor-page-container">
            {/* Page Header */}
            <div className="instructor-page-header">
                <div>
                    <h1 className="instructor-page-title">Announcements</h1>
                    <p className="instructor-page-subtitle">Send updates and important messages to your students.</p>
                </div>
                <button
                    onClick={() => navigate('/instructor/announcements/create')}
                    className="btn btn-primary"
                >
                    <Plus size={18} /> New Announcement
                </button>
            </div>

            {/* Announcements List Card */}
            <div className="card">
                <div className="card-header-flex" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h3 className="card-header-title">Sent Announcements ({announcements.length})</h3>
                </div>

                <div style={{ padding: '1.25rem 1.5rem' }}>
                    {loading ? (
                        <div className="flex-center" style={{ padding: '4rem' }}>
                            <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                        </div>
                    ) : announcements.length === 0 ? (
                        <div className="empty-state-container">
                            <div className="empty-state-content">
                                <div className="empty-state-icon-wrapper">
                                    <Bell size={36} />
                                </div>
                                <h3 className="empty-state-title">No announcements yet</h3>
                                <p className="empty-state-text">
                                    Keep your students engaged by sharing updates, resources, or reminders.
                                </p>
                                <button
                                    onClick={() => navigate('/instructor/announcements/create')}
                                    className="btn btn-primary"
                                    style={{ marginTop: '1.5rem' }}
                                >
                                    <Plus size={16} /> Create First Announcement
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {announcements.map(ann => (
                                <div
                                    key={ann._id}
                                    className="announcement-item-card animate-in"
                                >
                                    {/* Header row */}
                                    <div className="announcement-item-header">
                                        <div className="announcement-item-meta">
                                            <h4 className="announcement-item-title">{ann.title}</h4>
                                            <div className="announcement-item-tags">
                                                {ann.audienceType === 'all' ? (
                                                    <span className="badge-primary-light">All Students</span>
                                                ) : (
                                                    <span className="announcement-course-tag">
                                                        <BookOpen size={13} />
                                                        {ann.course?.title || 'Course'}
                                                    </span>
                                                )}
                                                <span className="announcement-date-tag">
                                                    <Calendar size={13} />
                                                    {new Date(ann.createdAt).toLocaleDateString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(ann._id)}
                                            className="btn-icon-danger"
                                            title="Delete Announcement"
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>

                                    {/* Message body */}
                                    <p className="announcement-item-message">{ann.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstructorMessages;
