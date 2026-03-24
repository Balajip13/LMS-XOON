import { useState, useEffect } from 'react';
import {
    BookOpen,
    Plus,
    Edit,
    Trash2,
    AlertCircle,
    RefreshCw,
    X,
    Star,
    CheckCircle,
    Search,
    Clock,
    Eye,
    Tag
} from 'lucide-react';
import { getPricingData } from '../../utils/pricing';
import AdminEmptyState from '../../components/AdminEmptyState';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const AdminCourses = () => {
    const { api } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all'); // all, pending, published
    const [editingCourse, setEditingCourse] = useState(null);
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        price: '',
        discountPercentage: 0,
        isPublished: false,
        status: '',
        isFeatured: false
    });

    const [searchTerm, setSearchTerm] = useState('');

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchCourses();
            toast.success("Data refreshed successfully");
        } catch (err) {
            toast.error("Failed to refresh data");
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/courses');
            setCourses(data.courses || []);
        } catch (err) {
            console.error('Failed to fetch courses:', err);
            if (!err.response || err.response.status >= 500) {
                toast.error('Server error while loading courses');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (course) => {
        setEditingCourse(course);
        setEditForm({
            title: course.title,
            description: course.description || '',
            price: course.price,
            originalPrice: course.originalPrice || course.price,
            discountPercentage: course.discountPercentage || 0,
            isPublished: course.isPublished,
            status: course.status || 'pending',
            isFeatured: course.isFeatured || false
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put(`/courses/${editingCourse._id}`, editForm);
            setCourses(courses.map(c => c._id === data._id ? data : c));
            setEditingCourse(null);
            toast.success('Course updated successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update course');
        }
    };

    const handleQuickAction = async (course, updates) => {
        try {
            const { data } = await api.put(`/courses/${course._id}`, updates);
            setCourses(courses.map(c => c._id === data._id ? data : c));
            toast.success('Status updated');
        } catch (err) {
            toast.error("Action failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;
        try {
            await api.delete(`/courses/${id}`);
            setCourses(courses.filter(c => c._id !== id));
            toast.success("Course deleted");
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete course');
        }
    };

    const filteredCourses = courses.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.instructor?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' ||
            (filter === 'pending' && c.status === 'pending') ||
            (filter === 'published' && c.isPublished);
        return matchesSearch && matchesFilter;
    });

    if (loading && courses.length === 0) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="admin-page-container">
            <header className="admin-page-header">
                <h1 className="admin-page-title">Catalog</h1>
                <div className="header-actions">
                    <button
                        className="btn btn-outline btn-compact"
                        onClick={handleRefresh}
                        disabled={refreshing || loading}
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button className="btn btn-primary btn-compact" onClick={() => window.location.href = '/admin/courses/new'}>
                        <Plus size={14} /> New Course
                    </button>
                </div>
            </header>

            <div className="admin-tabs">
                <button className={`tab-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                    All Courses
                </button>
                <button className={`tab-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
                    Pending Approval
                    {courses.filter(c => c.status === 'pending').length > 0 && (
                        <span className="badge-count">{courses.filter(c => c.status === 'pending').length}</span>
                    )}
                </button>
                <button className={`tab-btn ${filter === 'published' ? 'active' : ''}`} onClick={() => setFilter('published')}>
                    Live / Published
                </button>
            </div>

            <div className="admin-section-card">
                <div className="admin-controls-grid">
                    <div className="search-container">
                        <div className="search-bar-container">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by title or instructor..."
                                className="form-control"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {filteredCourses.length === 0 ? (
                    <AdminEmptyState
                        icon={BookOpen}
                        title="No courses found"
                        message={searchTerm ? `No results for "${searchTerm}"` : "The platform course catalog is currently empty."}
                        onRefresh={fetchCourses}
                    />
                ) : (
                    <div className="table-container">
                        <table className="admin-table responsive-table-stack">
                            <thead>
                                <tr>
                                    <th>Course Identity</th>
                                    <th>Expert</th>
                                    <th>Monetization</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'center' }}>Featured</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCourses.map(course => (
                                    <tr key={course._id}>
                                        <td className="course-section" data-label="Course Identity">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                {course.thumbnailUrl || course.thumbnail ? (
                                                    <img
                                                        src={course.thumbnailUrl || course.thumbnail}
                                                        alt=""
                                                        style={{ width: '60px', height: '40px', borderRadius: '8px', objectFit: 'cover', boxShadow: 'var(--shadow-sm)' }}
                                                    />
                                                ) : (
                                                    <div style={{ width: '60px', height: '40px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <BookOpen size={18} style={{ color: 'var(--text-muted)' }} />
                                                    </div>
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>{course.title}</div>
                                                    <div className="flex items-center gap-2" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{course.category?.name || course.category || 'Standard'}</span>
                                                        <span>•</span>
                                                        <span>{course.lessonsCount || 0} lessons</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="course-section" data-label="Expert">
                                            <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{course.instructor?.name || 'Platform'}</div>
                                        </td>
                                        <td className="course-section" data-label="Monetization">
                                            {(() => {
                                                const pricing = getPricingData(course);
                                                return (
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        {pricing.hasDiscount && (
                                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                                                {pricing.displayOriginalPrice}
                                                            </span>
                                                        )}
                                                        <span style={{ fontWeight: 700, color: 'var(--text)' }}>{pricing.displayPrice}</span>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="course-section">
                                            <div className="status-section">
                                                <span className="action-label">Status</span>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
                                                    <span className={`status-badge ${course.status === 'approved' ? 'active' : course.status === 'rejected' ? 'suspended' : 'pending'}`}>
                                                        {course.status || 'Pending'}
                                                    </span>
                                                    {course.isPublished && (
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                            <Eye size={10} /> LIVE
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="course-section">
                                            <div className="featured-section">
                                                <span className="action-label">Featured</span>
                                                <button
                                                    onClick={() => handleQuickAction(course, { isFeatured: !course.isFeatured })}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: course.isFeatured ? '#f59e0b' : '#cbd5e1',
                                                        padding: '0.5rem',
                                                        transition: 'transform 0.2s'
                                                    }}
                                                    className="hover:scale-110"
                                                >
                                                    <Star size={20} fill={course.isFeatured ? "currentColor" : "none"} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="course-section">
                                            <div className="course-actions">
                                                <span className="action-label">Actions</span>
                                                <div className="action-buttons">
                                                    {course.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleQuickAction(course, { status: 'approved' })}
                                                                className="admin-action-btn"
                                                                title="Approve Course"
                                                                style={{ color: 'var(--success)', borderColor: 'rgba(21, 128, 61, 0.2)' }}
                                                            >
                                                                <CheckCircle size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleQuickAction(course, { status: 'rejected' })}
                                                                className="admin-action-btn danger"
                                                                title="Reject Course"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button onClick={() => handleEdit(course)} className="admin-action-btn" title="Audit Details">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(course._id)} className="admin-action-btn danger" title="Remove Permanently">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Premium Audit/Edit Modal */}
            {editingCourse && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }} onClick={() => setEditingCourse(null)}>
                    <div style={{
                        backgroundColor: 'var(--surface)',
                        borderRadius: '16px',
                        padding: '2.5rem',
                        maxWidth: '600px',
                        width: '95%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)' }}>Audit Course</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Review and modify course visibility and pricing</p>
                            </div>
                            <button onClick={() => setEditingCourse(null)} className="admin-action-btn" style={{ padding: '0.5rem' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate}>
                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Professional Title</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editForm.title}
                                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                        required
                                        style={{ fontSize: '1.1rem', padding: '0.8rem 1rem' }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Approval Status</label>
                                        <select
                                            className="form-control"
                                            value={editForm.status}
                                            onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                                            style={{ height: '48px', fontWeight: 600 }}
                                        >
                                            <option value="pending">⏳ Pending Review</option>
                                            <option value="approved">✅ Approved</option>
                                            <option value="rejected">❌ Rejected</option>
                                            <option value="draft">📝 Draft Mode</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                        <label className="flex items-center gap-3" style={{ cursor: 'pointer', background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                            <input
                                                type="checkbox"
                                                checked={editForm.isFeatured}
                                                onChange={e => setEditForm({ ...editForm, isFeatured: e.target.checked })}
                                                style={{ width: '20px', height: '20px' }}
                                            />
                                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Featured</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Catalog Description</label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        value={editForm.description}
                                        onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                        style={{ resize: 'none', padding: '1rem' }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>SALE PRICE (₹)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={editForm.price}
                                            onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                                            required
                                            style={{ background: 'white', fontWeight: 700 }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>LIST PRICE (₹)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={editForm.originalPrice}
                                            onChange={e => setEditForm({ ...editForm, originalPrice: e.target.value })}
                                            style={{ background: 'white', fontWeight: 700 }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>DISCOUNT (%)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={editForm.discountPercentage}
                                            onChange={e => setEditForm({ ...editForm, discountPercentage: e.target.value })}
                                            style={{ background: 'white', fontWeight: 700 }}
                                        />
                                    </div>
                                </div>
                                <label className="flex items-center gap-3" style={{ cursor: 'pointer', padding: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={editForm.isPublished}
                                        onChange={e => setEditForm({ ...editForm, isPublished: e.target.checked })}
                                        style={{ width: '22px', height: '22px' }}
                                    />
                                    <span style={{ fontWeight: 700, color: editForm.isPublished ? 'var(--success)' : 'var(--text-secondary)' }}>
                                        {editForm.isPublished ? 'Published & Visible to Public' : 'Hide from Public Catalog'}
                                    </span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '1rem' }}>
                                    Confirm Audit Changes
                                </button>
                                <button type="button" onClick={() => setEditingCourse(null)} className="btn btn-outline" style={{ flex: 1 }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCourses;
