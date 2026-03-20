import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Send, Bell, Users, BookOpen, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateAnnouncement = () => {
    const { api } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);
    const [fetchingCourses, setFetchingCourses] = useState(true);

    const [formData, setFormData] = useState({
        title: '',
        message: '',
        courseId: '',
        audienceType: 'course'
    });

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await api.get('/instructor/courses');
                const courseList = data.courses || data || [];
                setCourses(courseList);
                if (courseList.length > 0) {
                    setFormData(prev => ({ ...prev, courseId: courseList[0]._id }));
                }
            } catch (error) {
                toast.error('Failed to load courses');
            } finally {
                setFetchingCourses(false);
            }
        };
        fetchCourses();
    }, [api]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (courses.length === 0) {
            return toast.error('Please create a course first before sending announcements.');
        }
        if (!formData.title || !formData.message) {
            return toast.error('Please fill in all required fields');
        }
        if (formData.audienceType === 'course' && !formData.courseId) {
            return toast.error('Please select a target course');
        }

        try {
            setLoading(true);
            await api.post('/announcements', formData);
            toast.success('Announcement posted successfully!');
            navigate('/instructor/messages');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post announcement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="instructor-page-container-compact">
            {/* Page Header */}
            <div className="instructor-page-header">
                <div className="header-left">
                    <h1 className="instructor-page-title">Create Announcement</h1>
                    <p className="instructor-page-subtitle">Send updates and important messages to your students</p>
                </div>
                <button
                    onClick={() => navigate('/instructor/messages')}
                    className="back-btn-modern"
                >
                    Back
                </button>
            </div>

            {/* Form */}
            {fetchingCourses ? (
                <div className="flex-center" style={{ padding: '5rem' }}>
                    <Loader2 className="animate-spin" size={36} color="var(--primary)" />
                </div>
            ) : courses.length === 0 ? (
                <div className="modern-form-card shadow-soft animate-fade-in" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <Bell size={48} style={{ opacity: 0.4, marginBottom: '1.5rem', color: 'var(--primary)' }} />
                    <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1.25rem' }}>No Courses Found</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '360px', margin: '0 auto 2rem' }}>
                        You need at least one published course to send announcements to your students.
                    </p>
                    <button onClick={() => navigate('/instructor/courses')} className="btn-primary-modern shadow-sm">
                        <BookOpen size={18} />
                        <span>Go to My Courses</span>
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="modern-form-card shadow-soft animate-fade-in">
                    <div className="form-section">

                        {/* Audience Row: Two Columns on Desktop */}
                        <div className="announcement-audience-row">
                            <div className="form-group-modern">
                                <label className="label-modern">
                                    <Users size={15} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                                    Send To <span className="required">*</span>
                                </label>
                                <div className="input-with-icon">
                                    <Users className="input-icon-left" size={18} />
                                    <select
                                        name="audienceType"
                                        value={formData.audienceType}
                                        onChange={handleChange}
                                        className="modern-select-field"
                                    >
                                        <option value="all">All Students</option>
                                        <option value="course">Specific Course Students</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group-modern">
                                <label className="label-modern">
                                    <BookOpen size={15} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                                    Target Course {formData.audienceType === 'course' && <span className="required">*</span>}
                                </label>
                                <div className="input-with-icon">
                                    <BookOpen className="input-icon-left" size={18} />
                                    <select
                                        name="courseId"
                                        value={formData.courseId}
                                        onChange={handleChange}
                                        disabled={formData.audienceType === 'all'}
                                        required={formData.audienceType === 'course'}
                                        className="modern-select-field"
                                        style={{ opacity: formData.audienceType === 'all' ? 0.5 : 1 }}
                                    >
                                        <option value="">Select a course...</option>
                                        {courses.map(c => (
                                            <option key={c._id} value={c._id}>{c.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="form-group-modern">
                            <label className="label-modern">
                                <Bell size={15} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                                Announcement Title <span className="required">*</span>
                            </label>
                            <div className="input-with-icon">
                                <Bell className="input-icon-left" size={18} />
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g., New Resources Available, Class Rescheduled"
                                    className="modern-input-field"
                                    required
                                />
                            </div>
                        </div>

                        {/* Message */}
                        <div className="form-group-modern">
                            <label className="label-modern">
                                <FileText size={15} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                                Message Content <span className="required">*</span>
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Write your message to students here. Be clear, concise, and informative..."
                                className="modern-textarea-field"
                                required
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="form-actions-modern">
                        <button
                            type="button"
                            onClick={() => navigate('/instructor/messages')}
                            className="btn-ghost-modern"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary-modern shadow-sm"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    <span>Posting...</span>
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    <span>Post Announcement</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default CreateAnnouncement;
