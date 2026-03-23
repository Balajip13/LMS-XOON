import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    PlayCircle, CheckCircle, Monitor, Infinity, Award,
    BookOpen, Star, Play, Plus, Minus, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { formatINR } from '../../utils/currency';

// --- Inline Star Rating Component ---
const StarRating = ({ rating, numReviews, readOnly = false }) => {
    const display = rating || 0;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {[1, 2, 3, 4, 5].map(s => (
                <Star
                    key={s}
                    size={readOnly ? 14 : 18}
                    fill={s <= Math.round(display) ? '#fbbf24' : 'none'}
                    color={s <= Math.round(display) ? '#fbbf24' : '#94a3b8'}
                />
            ))}
            {numReviews > 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.2rem' }}>
                    {typeof rating === 'number' ? rating.toFixed(1) : '0.0'} ({numReviews})
                </span>
            )}
        </div>
    );
};

const StudentCourseDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, api } = useAuth();

    const [course, setCourse] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const [expandedChapters, setExpandedChapters] = useState(new Set());
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get(`/courses/${id}`);
                setCourse(data.course || data);

                if (user?.role === 'student') {
                    try {
                        const { data: enrData } = await api.get(`/enrollments/check/${id}`);
                        setIsEnrolled(enrData.isEnrolled || false);
                    } catch { /* not enrolled */ }
                }
            } catch {
                toast.error('Failed to load course details');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id, user, api]);

    const handleEnroll = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role !== 'student') {
            toast.error('Only students can enroll in courses');
            return;
        }
        // Already enrolled → go directly to learn page
        if (isEnrolled) {
            navigate(`/student/course/${id}/learn`);
            return;
        }

        // ── DEV BYPASS: payment step is disabled. All courses enroll for free. ──
        // To restore paid flow, replace the block below with:
        //   if (course?.price > 0) { navigate(`/payment/${id}`); return; }
        try {
            toast.loading('Enrolling...');
            await api.post('/enrollments/free', { courseId: id });
            toast.dismiss();
            toast.success('Enrolled successfully!');
            navigate(`/student/course/${id}/learn`);
        } catch (error) {
            toast.dismiss();
            toast.error(error.response?.data?.message || 'Enrollment failed. Please try again.');
        }
        // ── END DEV BYPASS ──
    };

    const toggleChapterExpand = (cid) => {
        setExpandedChapters(prev => {
            const next = new Set(prev);
            next.has(cid) ? next.delete(cid) : next.add(cid);
            return next;
        });
    };

    // --- Loading State ---
    if (loading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)', display: 'flex', flexDirection: 'column' }}>
                <StudentHeader navigate={navigate} />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>Loading course details...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)', display: 'flex', flexDirection: 'column' }}>
                <StudentHeader navigate={navigate} />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                    <BookOpen size={48} color="var(--text-muted)" />
                    <p style={{ color: 'var(--text-secondary)' }}>Course not found.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/student/courses')}>Back to Catalog</button>
                </div>
            </div>
        );
    }

    const curriculum = course.chapters || [];
    const pricing = course;

    // --- FULL SALES VIEW ---
    return (
        <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', paddingBottom: '5rem', overflowX: 'hidden' }}>
            {/* Student-Specific Header */}
            <StudentHeader navigate={navigate} />

            {/* 1. Dark Banner */}
            <div style={{ backgroundColor: '#2f3b52', color: '#fff', paddingTop: isMobile ? '2rem' : '2.5rem', paddingBottom: isMobile ? '2rem' : '2.5rem', marginBottom: '1.5rem', width: '100%' }}>
                <div className="container" style={{ maxWidth: isMobile ? '800px' : '1200px', margin: '0 auto', padding: isMobile ? '0 1.25rem' : '0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxWidth: '800px' }}>
                        <h1 style={{ fontSize: isMobile ? '1.6rem' : '2.1rem', fontWeight: '800', lineHeight: '1.2', margin: 0, color: '#fff' }}>{course.title}</h1>
                        <p style={{ fontSize: '1rem', lineHeight: '1.5', opacity: 0.9, margin: 0 }}>{course.description}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: '#f3ca8c', fontWeight: '800', fontSize: '1.1rem' }}>{course.rating?.toFixed(1) || '0.0'}</span>
                                <StarRating rating={course.rating} numReviews={0} readOnly />
                            </div>
                            <span style={{ color: '#cec0fc', textDecoration: 'underline', fontSize: '0.9rem' }}>({course.numReviews || 0} ratings)</span>
                            <span style={{ fontSize: '0.9rem' }}>{course.studentCount || 0} students</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Main Two-Column Grid */}
            <div className="container" style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) 350px',
                gap: isMobile ? '1.5rem' : '4rem',
                alignItems: 'start',
                padding: isMobile ? '0 1.25rem' : '0',
                maxWidth: isMobile ? '800px' : '1200px',
                margin: '0 auto',
                width: '100%',
                boxSizing: 'border-box'
            }}>

                {/* LEFT: Content Sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', order: isMobile ? 2 : 1, width: '100%' }}>
                    <div style={{
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        backgroundColor: 'var(--surface)',
                        padding: isMobile ? '1.25rem' : '2.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2.2rem'
                    }}>
                        {/* Section A: What You'll Learn */}
                        {(course.learningOutcomes?.length > 0) && (
                            <section>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text)' }}>What You'll Learn</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '0.75rem' : '1rem' }}>
                                    {course.learningOutcomes.map((outcome, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                                            <CheckCircle size={16} color="#22c55e" style={{ marginTop: '4px', flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: '1.4' }}>{outcome}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {course.learningOutcomes?.length > 0 && course.requirements?.length > 0 && (
                            <div style={{ borderTop: '1px solid var(--border)', opacity: 0.6 }} />
                        )}

                        {/* Section B: Requirements */}
                        {(course.requirements?.length > 0) && (
                            <section>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text)' }}>Requirements</h2>
                                <ul style={{ margin: 0, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    {course.requirements.map((req, idx) => (
                                        <li key={idx} style={{ fontSize: '0.95rem', color: 'var(--text)', lineHeight: '1.4' }}>{req}</li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        <div style={{ borderTop: '1px solid var(--border)', opacity: 0.6 }} />

                        {/* Section C: Course Curriculum */}
                        <section>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text)' }}>Course Content</h2>
                            <div style={{ border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                {curriculum.map((chapter, i) => {
                                    const cid = chapter._id || `ch${i}`;
                                    const isExp = expandedChapters.has(cid);
                                    return (
                                        <div key={cid} style={{ borderBottom: i < curriculum.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                            <button
                                                onClick={() => toggleChapterExpand(cid)}
                                                style={{
                                                    width: '100%',
                                                    padding: isMobile ? '1.25rem 1.25rem' : '1.1rem 1.5rem',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    backgroundColor: 'var(--surface-hover)',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    gap: '1rem'
                                                }}
                                            >
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '0.15rem', flex: 1, minWidth: 0 }}>
                                                    <span style={{ fontWeight: '700', fontSize: isMobile ? '0.9rem' : '1rem', color: 'var(--text)', wordBreak: 'break-word' }}>{chapter.title}</span>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{chapter.lessons?.length || 0} lectures</span>
                                                </div>
                                                {isExp ? <Minus size={18} color="var(--text)" style={{ flexShrink: 0 }} /> : <Plus size={18} color="var(--text)" style={{ flexShrink: 0 }} />}
                                            </button>

                                            {isExp && (
                                                <div style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
                                                    {chapter.lessons?.map((lesson, j) => (
                                                        <div key={j} style={{
                                                            padding: isMobile ? '1.25rem 1.25rem' : '1rem 1.5rem',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'flex-start',
                                                            gap: '1.5rem',
                                                            borderBottom: j < chapter.lessons.length - 1 ? '1px solid var(--border)' : 'none'
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', minWidth: 0 }}>
                                                                <PlayCircle size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                                                <span style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: '1.5' }}>{lesson.title}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                </div>

                {/* RIGHT: Purchase Card */}
                <div style={{ position: 'relative', order: isMobile ? 1 : 2, width: '100%' }}>
                    <div style={{
                        position: isMobile ? 'static' : 'sticky',
                        top: isMobile ? '0' : '5rem',
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        maxWidth: isMobile ? '100%' : '350px',
                        margin: isMobile ? '0 auto 2rem' : '0',
                        width: '100%',
                        boxSizing: 'border-box'
                    }}>
                        {/* Video Preview Thumbnail */}
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', backgroundColor: '#1c1d1f', cursor: 'pointer', overflow: 'hidden' }}
                            onClick={() => course.videoUrl && setShowPreview(true)}>
                            {showPreview && course.videoUrl ? (
                                course.videoUrl.includes('youtube') || course.videoUrl.includes('youtu.be') ? (
                                    <iframe
                                        src={course.videoUrl.replace('watch?v=', 'embed/')}
                                        title="Preview"
                                        allow="autoplay; encrypted-media"
                                        allowFullScreen
                                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                                    />
                                ) : (
                                    <video src={course.videoUrl} controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                )
                            ) : (
                                <>
                                    <img
                                        src={course.thumbnailUrl || course.thumbnail}
                                        alt={course.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                                    />
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                        <div style={{ width: isMobile ? 48 : 56, height: isMobile ? 48 : 56, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                                            <Play size={isMobile ? 22 : 26} fill="#1c1d1f" color="#1c1d1f" style={{ marginLeft: '3px' }} />
                                        </div>
                                    </div>
                                    <div style={{ position: 'absolute', bottom: isMobile ? '0.85rem' : '1.25rem', width: '100%', textAlign: 'center', color: '#fff', fontWeight: '800', fontSize: isMobile ? '0.8rem' : '0.95rem', textShadow: '0 2px 8px rgba(0,0,0,0.9)', zIndex: 2 }}>Preview this course</div>
                                </>
                            )}
                        </div>

                        {/* Price & Enroll */}
                        <div style={{ padding: isMobile ? '1.25rem' : '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                {course.originalPrice > course.price && (
                                    <span style={{ fontSize: isMobile ? '1rem' : '1.1rem', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                                        {formatINR(course.originalPrice)}
                                    </span>
                                )}
                                <span style={{ fontSize: isMobile ? '2rem' : '2.4rem', fontWeight: '800', color: 'var(--text)' }}>
                                    {formatINR(course.price || 0)}
                                </span>
                            </div>

                            <button
                                onClick={handleEnroll}
                                className="btn btn-primary"
                                style={{ width: '100%', height: '3.4rem', fontSize: '1.1rem', fontWeight: '700', borderRadius: '4px', marginBottom: '1rem' }}
                            >
                                {isEnrolled ? 'Go to Course' : user ? 'Enroll Now' : 'Login to Enroll'}
                            </button>

                            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', wordBreak: 'break-word' }}>
                                30-Day Money-Back Guarantee
                            </p>

                            <div style={{ borderTop: '1px solid var(--border)', margin: '1.5rem 0', opacity: 0.6 }} />

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>This course includes:</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}><Monitor size={16} /> <span>Access on mobile and TV</span></div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}><Infinity size={16} /> <span>Full lifetime access</span></div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}><Award size={16} /> <span>Certificate of completion</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Minimal student header: logo + Back to Dashboard
const StudentHeader = ({ navigate }) => (
    <header style={{
        height: '64px',
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 500,
        justifyContent: 'space-between'
    }}>
        <img
            src="/logo.png"
            alt="XOON"
            style={{ height: '36px', cursor: 'pointer' }}
            onClick={() => navigate('/student/dashboard')}
        />
        <button
            onClick={() => navigate('/student/courses')}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.1rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem' }}
        >
            <ArrowLeft size={16} /> Back to Catalog
        </button>
    </header>
);

export default StudentCourseDetailPage;
