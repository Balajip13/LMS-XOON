import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Loader2, BookOpen, Users, Star, IndianRupee,
    FileText, HelpCircle, Edit, ExternalLink,
    Layout, CheckCircle2, AlertCircle, ArrowLeft,
    Clock, List, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const InstructorCourseOverview = () => {
    const { id } = useParams();
    const { api } = useAuth();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        assignmentsCount: 0,
        quizzesCount: 0
    });

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setLoading(true);
                const [courseRes, assignmentRes, quizRes] = await Promise.all([
                    api.get(`/courses/${id}`),
                    api.get(`/instructor/assignments?courseId=${id}`),
                    api.get(`/instructor/quizzes?courseId=${id}`)
                ]);

                setCourse(courseRes.data);
                setStats({
                    assignmentsCount: assignmentRes.data.data?.length || 0,
                    quizzesCount: quizRes.data.data?.length || 0
                });
            } catch (error) {
                toast.error('Failed to load course overview');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [id, api]);

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '80vh' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="instructor-page-container flex-center">
                <div className="empty-state">
                    <AlertCircle size={48} color="var(--error)" />
                    <h2 style={{ marginTop: '1rem' }}>Course not found</h2>
                    <button onClick={() => navigate('/instructor/courses')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        Back to My Courses
                    </button>
                </div>
            </div>
        );
    }

    const totalLessons = course.chapters?.reduce((acc, chap) => acc + (chap.lessons?.length || 0), 0) || 0;

    return (
        <div className="instructor-page-container animate-in">
            {/* Hero Header Section */}
            <div className="instructor-page-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <span className={`status-badge ${course.status || 'pending'}`}>
                            {course.status?.toUpperCase() || 'PENDING'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            <Clock size={14} />
                            <span>Created {new Date(course.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <h1 className="instructor-page-title" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', lineHeight: '1.2' }}>{course.title}</h1>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1.5rem' }}>
                        <div className="flex items-center gap-2" title="Students">
                            <Users size={18} className="text-primary" />
                            <span style={{ fontSize: '0.95rem' }}><strong>{course.studentCount || 0}</strong> Students</span>
                        </div>
                        <div className="flex items-center gap-2" title="Rating">
                            <Star size={18} fill="#fbbf24" stroke="#fbbf24" />
                            <span style={{ fontSize: '0.95rem' }}><strong>{course.rating.toFixed(1)}</strong> rating</span>
                        </div>
                        <div className="flex items-center gap-2" title="Category">
                            <Layout size={18} className="text-primary" />
                            <span style={{ fontSize: '0.95rem' }}>{course.category?.name || 'General'}</span>
                        </div>
                    </div>
                </div>

                <div className="header-actions">
                    <button
                        onClick={() => navigate(`/instructor/courses/${id}/edit`)}
                        className="btn btn-primary"
                        style={{ width: '100%', maxWidth: '200px' }}
                    >
                        <Edit size={18} /> Edit Course
                    </button>
                </div>
            </div>

            <div className="overview-main-grid">
                {/* Main Content Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Stats Grid */}
                    <div className="instructor-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                        <div className="stat-card">
                            <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                <List size={20} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{course.chapters?.length || 0}</span>
                                <span className="stat-label">Chapters</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon-wrapper" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                                <BookOpen size={20} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{totalLessons}</span>
                                <span className="stat-label">Lessons</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon-wrapper" style={{ background: 'rgba(234, 88, 12, 0.1)', color: '#ea580c' }}>
                                <IndianRupee size={20} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">₹{course.price}</span>
                                <span className="stat-label">Price</span>
                            </div>
                        </div>
                    </div>

                    {/* Management Cards (Assignments & Quizzes) */}
                    <div className="management-actions-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="action-card-modern" onClick={() => navigate(`/instructor/course/${id}/assignments`)}>
                            <div className="action-card-header">
                                <div className="action-icon blue">
                                    <FileText size={22} />
                                </div>
                                <div className="action-count">{stats.assignmentsCount}</div>
                            </div>
                            <div className="action-card-body">
                                <h3>Assignments</h3>
                                <p>Manage tasks and check student submissions.</p>
                                <div className="action-link">
                                    Manage <ChevronRight size={14} />
                                </div>
                            </div>
                        </div>

                        <div className="action-card-modern" onClick={() => navigate(`/instructor/course/${id}/quizzes`)}>
                            <div className="action-card-header">
                                <div className="action-icon purple">
                                    <HelpCircle size={22} />
                                </div>
                                <div className="action-count">{stats.quizzesCount}</div>
                            </div>
                            <div className="action-card-body">
                                <h3>Quizzes</h3>
                                <p>Create interactive assessments for students.</p>
                                <div className="action-link">
                                    Manage <ChevronRight size={14} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="card">
                        <h2 className="section-title-modern">Course Description</h2>
                        <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                            {course.description || "No description provided for this course yet."}
                        </div>
                    </div>
                </div>

                {/* Sidebar area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Media Card */}
                    <div className="card" style={{ padding: '0.75rem' }}>
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                            <img
                                src={course.thumbnail}
                                alt={course.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/640x360?text=No+Thumbnail'; }}
                            />
                        </div>

                        <div style={{ padding: '0 0.5rem 0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                                <span className="text-muted" style={{ fontSize: '0.9rem' }}>Price</span>
                                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--success)' }}>₹{course.price}</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>Category</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{course.category?.name || 'General'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>Chapters</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{course.chapters?.length || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>Lessons</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{totalLessons}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Course Summary Card */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle2 size={18} className="text-primary" />
                            <span>Course Overview</span>
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                <CheckCircle2 size={14} className="text-success" />
                                Interactive assignments
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                <CheckCircle2 size={14} className="text-success" />
                                Comprehensive quizzes
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                <CheckCircle2 size={14} className="text-success" />
                                Progress tracking enabled
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructorCourseOverview;
