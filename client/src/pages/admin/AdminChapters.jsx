import { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Video, AlertCircle, RefreshCw, Edit2, X, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminChapters = () => {
    const { api } = useAuth();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAddChapter, setShowAddChapter] = useState(false);
    const [newChapter, setNewChapter] = useState({ title: '', order: 0 });
    const [addLessonTo, setAddLessonTo] = useState(null);
    const [newLesson, setNewLesson] = useState({ title: '', videoUrl: '', duration: '', order: 0 });
    const [editingChapter, setEditingChapter] = useState(null);
    const [editingLesson, setEditingLesson] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchChapters();
        }
    }, [selectedCourse]);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            setCourses(data.courses || []);
        } catch (err) {
            console.error('Failed to fetch courses:', err);
        }
    };

    const fetchChapters = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get(`/chapters/${selectedCourse}`);
            setChapters(data || []);
        } catch (err) {
            console.error('Failed to fetch chapters:', err);
            setError(err.response?.data?.message || 'Failed to load chapters');
        } finally {
            setLoading(false);
        }
    };

    const handleAddChapter = async (e) => {
        e.preventDefault();
        try {
            await api.post('/chapters', { ...newChapter, courseId: selectedCourse });
            setNewChapter({ title: '', order: 0 });
            setShowAddChapter(false);
            fetchChapters();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add chapter');
        }
    };

    const handleUpdateChapter = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/chapters/${editingChapter._id}`, { title: editingChapter.title, order: editingChapter.order });
            setEditingChapter(null);
            fetchChapters();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update chapter');
        }
    };

    const handleDeleteChapter = async (id) => {
        if (!window.confirm('Delete this chapter and all its lessons?')) return;
        try {
            await api.delete(`/chapters/${id}`);
            fetchChapters();
        } catch (err) {
            setError(err.response?.data?.message || 'Delete chapter failed');
        }
    };

    const handleAddLesson = async (e, chapterId) => {
        e.preventDefault();
        try {
            await api.post('/chapters/lesson', { ...newLesson, chapterId });
            setNewLesson({ title: '', videoUrl: '', duration: '', order: 0 });
            setAddLessonTo(null);
            fetchChapters();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add lesson');
        }
    };

    const handleUpdateLesson = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/chapters/lesson/${editingLesson._id}`, {
                title: editingLesson.title,
                videoUrl: editingLesson.videoUrl,
                duration: editingLesson.duration,
                order: editingLesson.order
            });
            setEditingLesson(null);
            fetchChapters();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update lesson');
        }
    };

    const handleDeleteLesson = async (id) => {
        if (!window.confirm('Delete this lesson?')) return;
        try {
            await api.delete(`/chapters/lesson/${id}`);
            fetchChapters();
        } catch (err) {
            setError(err.response?.data?.message || 'Delete lesson failed');
        }
    };

    return (
        <div className="admin-page-container">
            <header className="admin-page-header">
                <h1 className="admin-page-title">Curriculum</h1>
                <div className="header-actions">
                    <button className="btn btn-outline btn-compact" onClick={fetchCourses}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
            </header>

            <div className="admin-section-card">
                <h2 className="admin-section-title">Select Course</h2>
                <select
                    className="input"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    style={{ maxWidth: '400px' }}
                >
                    <option value="">-- Choose a course --</option>
                    {courses.map(course => (
                        <option key={course._id} value={course._id}>{course.title}</option>
                    ))}
                </select>
            </div>

            {selectedCourse && (
                <>
                    {error && (
                        <div className="admin-error-state" style={{ marginBottom: '1.5rem' }}>
                            <AlertCircle size={32} style={{ margin: '0 auto 0.75rem' }} />
                            <p>{error}</p>
                            <button onClick={fetchChapters} className="export-btn">
                                <RefreshCw size={16} /> Retry
                            </button>
                        </div>
                    )}

                    <div className="admin-section-card">
                        <div className="flex-header" style={{ marginBottom: '1.5rem' }}>
                            <h2 className="admin-section-title" style={{ marginBottom: 0 }}>Course Curriculum</h2>
                            <button
                                onClick={() => setShowAddChapter(!showAddChapter)}
                                className="btn btn-primary btn-compact"
                            >
                                <Plus size={18} /> Add Chapter
                            </button>
                        </div>

                        <div style={{ marginBottom: '1.5rem', padding: '1.25rem', border: '1px solid var(--primary)', borderRadius: '12px', background: 'var(--primary-light)' }}>
                            <form onSubmit={handleAddChapter} className="user-controls-grid" style={{ alignItems: 'flex-end', gap: '1rem' }}>
                                <div className="search-bar-container">
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>CHAPTER TITLE</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., Introduction"
                                        value={newChapter.title}
                                        onChange={e => setNewChapter({ ...newChapter, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ width: '80px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>ORDER</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={newChapter.order}
                                        onChange={e => setNewChapter({ ...newChapter, order: e.target.value })}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary btn-compact" style={{ height: '42px' }}>
                                    Save
                                </button>
                            </form>
                        </div>

                        {loading && !error && (
                            <div className="admin-loading-state">
                                <p>Loading curriculum...</p>
                            </div>
                        )}

                        {!loading && !error && chapters.length === 0 && (
                            <div className="admin-empty-state">
                                <BookOpen size={48} />
                                <p>No chapters yet</p>
                                <span>Start building your course by adding chapters</span>
                            </div>
                        )}

                        {!loading && !error && chapters.length > 0 && (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {chapters.map((chapter) => (
                                    <div key={chapter._id} style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                                        <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-hover)' }}>
                                            {editingChapter && editingChapter._id === chapter._id ? (
                                                <form onSubmit={handleUpdateChapter} style={{ display: 'flex', gap: '0.5rem', flex: 1, marginRight: '1rem' }}>
                                                    <input
                                                        type="text"
                                                        className="input"
                                                        value={editingChapter.title}
                                                        onChange={e => setEditingChapter({ ...editingChapter, title: e.target.value })}
                                                        required
                                                        style={{ flex: 1, padding: '0.25rem 0.75rem', height: '32px' }}
                                                    />
                                                    <input
                                                        type="number"
                                                        className="input"
                                                        value={editingChapter.order}
                                                        onChange={e => setEditingChapter({ ...editingChapter, order: e.target.value })}
                                                        required
                                                        style={{ width: '60px', padding: '0.25rem 0.75rem', height: '32px' }}
                                                    />
                                                    <button type="submit" className="admin-action-btn" style={{ color: '#10b981' }} title="Save">
                                                        <Check size={16} />
                                                    </button>
                                                    <button type="button" onClick={() => setEditingChapter(null)} className="admin-action-btn" title="Cancel">
                                                        <X size={16} />
                                                    </button>
                                                </form>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{chapter.order}.</span>
                                                    <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{chapter.title}</h3>
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => setAddLessonTo(addLessonTo === chapter._id ? null : chapter._id)}
                                                    className="btn btn-outline btn-compact"
                                                >
                                                    {addLessonTo === chapter._id ? 'Cancel' : 'Add Lesson'}
                                                </button>
                                                {!editingChapter && (
                                                    <button
                                                        onClick={() => setEditingChapter({ ...chapter })}
                                                        className="admin-action-btn"
                                                        title="Edit Chapter"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteChapter(chapter._id)}
                                                    className="admin-action-btn danger"
                                                    title="Delete Chapter"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div style={{ padding: '1rem' }}>
                                            <div style={{ marginBottom: '1rem', padding: '1.25rem', background: 'var(--surface-hover)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                                <form onSubmit={(e) => handleAddLesson(e, chapter._id)} style={{ display: 'grid', gap: '1rem' }}>
                                                    <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>LESSON TITLE</label>
                                                            <input type="text" className="form-control" placeholder="e.g., Introduction" value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })} required />
                                                        </div>
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>VIDEO URL</label>
                                                            <input type="text" className="form-control" placeholder="e.g., https://..." value={newLesson.videoUrl} onChange={e => setNewLesson({ ...newLesson, videoUrl: e.target.value })} required />
                                                        </div>
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>DURATION</label>
                                                            <input type="text" className="form-control" placeholder="e.g., 10:30" value={newLesson.duration} onChange={e => setNewLesson({ ...newLesson, duration: e.target.value })} required />
                                                        </div>
                                                        <div style={{ width: '80px' }}>
                                                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>ORDER</label>
                                                            <input type="number" className="form-control" value={newLesson.order} onChange={e => setNewLesson({ ...newLesson, order: e.target.value })} required />
                                                        </div>
                                                    </div>
                                                    <button type="submit" className="btn btn-primary btn-compact" style={{ width: '100%', height: '42px' }}>
                                                        Save Lesson
                                                    </button>
                                                </form>
                                            </div>

                                            {chapter.lessons && chapter.lessons.length > 0 ? (
                                                <div style={{ display: 'grid', gap: '0.5rem' }}>
                                                    {chapter.lessons.map((lesson) => (
                                                        <div key={lesson._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                                            {editingLesson && editingLesson._id === lesson._id ? (
                                                                <form onSubmit={handleUpdateLesson} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr)) 60px auto auto', gap: '0.5rem', flex: 1 }}>
                                                                    <input type="text" className="form-control" value={editingLesson.title} onChange={e => setEditingLesson({ ...editingLesson, title: e.target.value })} required style={{ height: '36px', fontSize: '0.85rem' }} />
                                                                    <input type="text" className="form-control" value={editingLesson.videoUrl} onChange={e => setEditingLesson({ ...editingLesson, videoUrl: e.target.value })} required style={{ height: '36px', fontSize: '0.85rem' }} />
                                                                    <input type="text" className="form-control" value={editingLesson.duration} onChange={e => setEditingLesson({ ...editingLesson, duration: e.target.value })} required style={{ height: '36px', fontSize: '0.85rem' }} />
                                                                    <input type="number" className="form-control" value={editingLesson.order} onChange={e => setEditingLesson({ ...editingLesson, order: e.target.value })} required style={{ height: '36px', fontSize: '0.85rem' }} />
                                                                    <button type="submit" className="admin-action-btn" style={{ color: '#10b981' }} title="Save">
                                                                        <Check size={16} />
                                                                    </button>
                                                                    <button type="button" onClick={() => setEditingLesson(null)} className="admin-action-btn" title="Cancel">
                                                                        <X size={16} />
                                                                    </button>
                                                                </form>
                                                            ) : (
                                                                <>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                        <Video size={16} style={{ color: 'var(--primary)' }} />
                                                                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{lesson.order}.</span>
                                                                        <span>{lesson.title}</span>
                                                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>({lesson.duration})</span>
                                                                    </div>
                                                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                                        <button
                                                                            onClick={() => setEditingLesson({ ...lesson })}
                                                                            className="admin-action-btn"
                                                                            title="Edit Lesson"
                                                                        >
                                                                            <Edit2 size={14} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteLesson(lesson._id)}
                                                                            className="admin-action-btn danger"
                                                                            title="Delete Lesson"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                    No lessons in this chapter yet
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminChapters;

