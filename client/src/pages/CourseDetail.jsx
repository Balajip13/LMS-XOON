import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
    Play, 
    Pause,
    PlayCircle,
    Clock, 
    Users, 
    Award, 
    Star, 
    BookOpen, 
    Target, 
    TrendingUp,
    ChevronRight,
    ChevronDown,
    Menu,
    X,
    CheckCircle,
    Loader2,
    Heart,
    Share2,
    Download,
    FileText,
    DollarSign,
    Maximize,
    Volume2,
    Lock,
    Plus,
    Monitor,
    Minus,
    Infinity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/currency';

// --- Professional Video Player Component (ref-based) ---
const VideoPlayer = ({ src, onEnded, onUpdateProgress, onDurationReceived }) => {
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState('0:00');
    const [totalTime, setTotalTime] = useState('0:00');
    const [volume, setVolume] = useState(1);
    const videoRef = useRef(null);
    const vidEl = () => document.getElementById('lms-video-element');

    const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

    const togglePlay = () => {
        const v = vidEl(); if (!v) return;
        v.paused ? v.play() : v.pause();
    };

    const handleTimeUpdate = (e) => {
        const v = e.target;
        if (!v.duration) return;
        const pct = (v.currentTime / v.duration) * 100;
        setProgress(pct);
        setCurrentTime(fmt(v.currentTime));
        if (onUpdateProgress) onUpdateProgress(v.currentTime, v.duration);
    };

    const handleLoadedMetadata = (e) => {
        setTotalTime(fmt(e.target.duration));
        if (onDurationReceived) onDurationReceived(e.target.duration);
    };

    const handleSeek = (e) => {
        const v = vidEl(); if (!v || !v.duration) return;
        v.currentTime = (e.target.value / 100) * v.duration;
        setProgress(e.target.value);
    };

    const handleVolumeChange = (e) => {
        const v = vidEl(); if (!v) return;
        v.volume = e.target.value;
        setVolume(e.target.value);
    };

    const toggleFullscreen = () => {
        const v = vidEl(); if (v?.requestFullscreen) v.requestFullscreen();
    };

    return (
        <div className="pro-player-container" style={{ position: 'relative', width: '100%', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden' }}>
            <video
                id="lms-video-element"
                src={src}
                style={{ width: '100%', height: '100%' }}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={onEnded}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onClick={togglePlay}
            />

            <div className="player-controls" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.75rem 1rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <input
                    type="range" min="0" max="100" step="0.1"
                    value={progress}
                    onChange={handleSeek}
                    style={{ width: '100%', height: '4px', cursor: 'pointer', accentColor: '#3b82f6' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button onClick={togglePlay} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, display: 'flex' }}>
                            {playing ? <Pause size={20} fill="#fff" /> : <Play size={20} fill="#fff" />}
                        </button>
                        <span style={{ fontSize: '0.75rem', fontVariantNumeric: 'tabular-nums' }}>{currentTime} / {totalTime}</span>
                        <Volume2 size={16} />
                        <input type="range" min="0" max="1" step="0.05" value={volume} onChange={handleVolumeChange} style={{ width: '55px', height: '3px', accentColor: '#fff' }} />
                    </div>
                    <Maximize size={17} style={{ cursor: 'pointer' }} onClick={toggleFullscreen} />
                </div>
            </div>
        </div>
    );
};

// --- Inline Star Rating Component ---
const StarRating = ({ rating, numReviews, onRate, readOnly = false }) => {
    const [ratingHovered, setRatingHovered] = useState(0);
    const display = ratingHovered || rating || 0;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {[1, 2, 3, 4, 5].map(s => (
                <Star
                    key={s}
                    size={readOnly ? 14 : 20}
                    fill={s <= display ? '#fbbf24' : 'none'}
                    color={s <= display ? '#fbbf24' : '#94a3b8'}
                    style={{ cursor: readOnly ? 'default' : 'pointer', transition: 'transform 0.1s' }}
                    onMouseEnter={() => !readOnly && setRatingHovered(s)}
                    onMouseLeave={() => !readOnly && setRatingHovered(0)}
                    onClick={() => !readOnly && onRate && onRate(s)}
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

// --- Rating Modal Component ---
const RatingModal = ({ isOpen, onClose, onSubmit, courseTitle, initialRating = 5, initialComment = '' }) => {
    const [rating, setRating] = useState(initialRating);
    const [comment, setComment] = useState(initialComment);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hovered, setHovered] = useState(0);

    // Sync when props change (e.g. modal re-opens with existing rating)
    useEffect(() => {
        if (isOpen) {
            setRating(initialRating);
            setComment(initialComment);
            setHovered(0);
        }
    }, [isOpen, initialRating, initialComment]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!comment.trim()) {
            toast.error('Please write a comment before submitting');
            return;
        }
        setIsSubmitting(true);
        try {
            await onSubmit({ rating, comment });
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const display = hovered || rating;

    return (
        <div
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '20px', width: '90%', maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>Rate this Course</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: '4px' }}><X size={22} /></button>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>How would you rate <strong>{courseTitle}</strong>?</p>

                {/* Star picker */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', justifyContent: 'center' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <Star
                            key={star}
                            size={36}
                            fill={star <= display ? '#fbbf24' : 'none'}
                            color={star <= display ? '#fbbf24' : '#94a3b8'}
                            style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                            onMouseEnter={() => setHovered(star)}
                            onMouseLeave={() => setHovered(0)}
                            onClick={() => setRating(star)}
                        />
                    ))}
                </div>
                <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][display]}
                </p>

                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what you liked or how we can improve..."
                    rows={4}
                    style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text)', marginBottom: '1.25rem', outline: 'none', resize: 'none', fontSize: '0.9rem', lineHeight: 1.6, boxSizing: 'border-box' }}
                />

                <button
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.8rem', fontWeight: '700', fontSize: '0.95rem', opacity: isSubmitting ? 0.7 : 1 }}
                >
                    {isSubmitting ? 'Submitting...' : initialComment ? 'Update Review' : 'Submit Review'}
                </button>
            </div>
        </div>
    );
};

const CourseDetail = ({ enrollments = [], isPlayerMode = false }) => {
    const { id } = useParams();
    const { user, api, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollment, setEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchCourseDetail = async () => {
            try {
                const response = await api.get(`/courses/${id}`);
                setCourse(response.data);

                if (user && user.role === 'student') {
                    const checkEnrollment = await api.get(`/enrollments/check/${id}`);
                    const enrolled = checkEnrollment.data.isEnrolled;
                    setIsEnrolled(enrolled);

                    if (enrolled && isPlayerMode) {
                        const enrollmentDetail = await api.get(`/enrollments/detail/${id}`);
                        setEnrollment(enrollmentDetail.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching course detail:', error);
                toast.error('Failed to load course details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCourseDetail();
        }
    }, [id, user, api, isPlayerMode]);

    const handleEnroll = async () => {
        if (!user) {
            navigate('/login', { state: { returnUrl: `/course/${id}` } });
            return;
        }

        if (user.role !== 'student') {
            toast.error('Only students can enroll in courses');
            return;
        }

        try {
            toast.loading('Initiating enrollment...');
            const response = await api.post('/enrollments/initiate', { courseId: id });

            toast.dismiss();

            if (response.data.success) {
                toast.success(response.data.message || 'Enrollment successful!');
                
                // Refresh user data to update enrolled courses
                await refreshUser();
                
                // Refresh the course data to update enrollment status
                const courseResponse = await api.get(`/courses/${id}`);
                setCourse(courseResponse.data);
                
                // Check enrollment status again
                const checkEnrollment = await api.get(`/enrollments/check/${id}`);
                const enrolled = checkEnrollment.data.isEnrolled;
                setIsEnrolled(enrolled);
                
                // Redirect to learning page
                setTimeout(() => {
                    navigate(`/student/course/${id}/learn`);
                }, 1500);
            } else {
                toast.error(response.data.message || 'Enrollment failed');
            }
        } catch (error) {
            toast.dismiss();
            toast.error(error.response?.data?.message || 'Failed to enroll');
            console.error('Enrollment error:', error);
        }
    };

    const [activeTab, setActiveTab] = useState('curriculum');
    const [currentLesson, setCurrentLesson] = useState(null);
    const [expandedChapters, setExpandedChapters] = useState(new Set());
    const [notes, setNotes] = useState([]);
    const [noteInput, setNoteInput] = useState('');
    const [currentVideo, setCurrentVideo] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [myRating, setMyRating] = useState({ rating: 5, comment: '' });
    const [reviews, setReviews] = useState([]);
    const [quizData, setQuizData] = useState(null);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);
    const [submittingQuiz, setSubmittingQuiz] = useState(false);

    // Refs for precise time tracking
    const timeAccumulatorRef = useRef(0);
    const lastClockTimeRef = useRef(0);

    // Fetch Quiz Data for student
    useEffect(() => {
        if (isPlayerMode && id && isEnrolled) {
            api.get(`/courses/${id}/quiz`)
                .then(res => setQuizData(res.data.data))
                .catch(err => console.log('Quiz not found or error:', err.message));
        }
    }, [isPlayerMode, id, isEnrolled, api]);

    const handleQuizSubmit = async () => {
        if (!quizData) return;
        const totalQuestions = quizData.questions.length;
        const answersArray = quizData.questions.map((_, idx) => quizAnswers[idx] ?? -1);

        try {
            setSubmittingQuiz(true);
            const res = await api.post(`/courses/${id}/quiz/submit`, { answers: answersArray });
            setQuizResult(res.data);
            // Refresh enrollment to get updated score
            const enrollmentDetail = await api.get(`/enrollments/detail/${id}`);
            setEnrollment(enrollmentDetail.data);
            toast.success(res.data.passed ? '🎉 Congratulations! You passed the quiz.' : 'Try again! You can do better.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit quiz');
        } finally {
            setSubmittingQuiz(false);
        }
    };

    const [downloadingCert, setDownloadingCert] = useState(false);

    const handleDownloadCertificate = async () => {
        setDownloadingCert(true);
        try {
            const response = await api.get(`/certificates/${id}`, {
                responseType: 'blob'
            });

            // Extract filename from header if possible, or use a default
            const contentDisposition = response.headers['content-disposition'];
            let filename = `${user?.name || 'Student'}-${course?.title || 'Course'}-Certificate.pdf`.replace(/[^a-z0-9.-]/gi, '_');

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Certificate downloaded successfully!');
        } catch (error) {
            console.error('Certificate download error:', error);
            const message = error.response?.data?.message || 'Failed to download certificate';
            toast.error(message);
            if (error.response?.status === 401) {
                navigate('/login', { state: { returnUrl: window.location.pathname } });
            }
        } finally {
            setDownloadingCert(false);
        }
    };

    // Fetch Feedback + detect student's own existing review to pre-fill modal
    useEffect(() => {
        if (id) {
            const fetchReviews = async () => {
                try {
                    const res = await api.get(`/reviews/course/${id}`);
                    setReviews(res.data);
                    if (user) {
                        const mine = res.data.find(r => r.user?._id?.toString() === user._id?.toString());
                        if (mine) setMyRating({ rating: mine.rating, comment: mine.comment });
                    }
                } catch (err) {
                    console.error('Error fetching reviews:', err);
                }
            };
            fetchReviews();
        }
    }, [id, api, user]);

    // Set first lesson as default if in player mode and not already set
    useEffect(() => {
        if (isPlayerMode && course && course.chapters && course.chapters.length > 0 && !currentLesson) {
            const firstChapter = course.chapters[0];
            if (firstChapter.lessons && firstChapter.lessons.length > 0) {
                const firstLesson = firstChapter.lessons[0];
                setCurrentLesson(firstLesson);
                setCurrentVideo(firstLesson.videoUrl);
                setExpandedChapters(new Set([firstChapter._id]));
            }
        }
    }, [isPlayerMode, course, currentLesson]);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Loading course...</p>
        </div>
    );
    if (!course) return <div className="container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>Course not found</div>;

    const curriculum = (course.chapters || []).filter(Boolean);

    const toggleChapterExpand = (chapterId) => {
        setExpandedChapters(prev => {
            const next = new Set(prev);
            if (next.has(chapterId)) { next.delete(chapterId); }
            else { next.add(chapterId); }
            return next;
        });
    };

    const handleLessonClick = (lesson) => {
        setCurrentLesson(lesson);
        setCurrentVideo(lesson.videoUrl || course.videoUrl);
        lastClockTimeRef.current = 0;
        timeAccumulatorRef.current = 0;
    };

    const handleLessonComplete = async (lessonId) => {
        try {
            const response = await api.post('/enrollments/complete-lesson', { courseId: id, lessonId });
            if (response.data.success) {
                setEnrollment(response.data.enrollment);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error completing lesson:', error);
            return false;
        }
    };

    const handleUpdateProgress = async (currentTime, duration) => {
        if (!duration || isNaN(duration)) return;
        const delta = currentTime - lastClockTimeRef.current;
        lastClockTimeRef.current = currentTime;
        if (delta > 0 && delta <= 1.5) {
            timeAccumulatorRef.current += delta;
            if (timeAccumulatorRef.current >= 30) {
                const secondsToSave = Math.floor(timeAccumulatorRef.current);
                api.post('/enrollments/update-time', {
                    courseId: id,
                    lessonId: currentLesson?._id,
                    secondsWatched: secondsToSave
                }).then(res => {
                    if (res.data.success) {
                        setEnrollment(prev => ({ ...prev, timeSpent: res.data.timeSpent }));
                    }
                }).catch(console.error);
                timeAccumulatorRef.current -= secondsToSave;
            }
        }
        if (currentTime / duration > 0.85 && currentLesson) {
            const completedIds = (enrollment?.completedLessons || []).map(cl => cl._id?.toString() || cl.toString());
            const isDone = completedIds.includes(currentLesson._id.toString());
            if (!isDone) {
                const success = await handleLessonComplete(currentLesson._id);
                if (success) {
                    toast.success(`✅ "${currentLesson.title}" completed!`, { style: { borderRadius: '10px' } });
                }
            }
        }
    };

    const handleDurationReceived = async (duration) => {
        if (!currentLesson || !duration || isNaN(duration)) return;
        if (!currentLesson.duration || currentLesson.duration === 0) {
            try {
                const res = await api.post('/enrollments/update-lesson-duration', {
                    lessonId: currentLesson._id,
                    duration: duration
                });
                if (res.data.success) {
                    setCourse(prevCourse => {
                        const newCourse = { ...prevCourse };
                        newCourse.chapters = newCourse.chapters.map(ch => ({
                            ...ch,
                            lessons: ch.lessons.map(l => l._id === currentLesson._id ? { ...l, duration: res.data.duration } : l)
                        }));
                        return newCourse;
                    });
                    setCurrentLesson(prev => ({ ...prev, duration: res.data.duration }));
                }
            } catch (error) {
                console.error('Failed to update lesson duration:', error);
            }
        }
    };

    const submitFeedback = async ({ rating, comment }) => {
        try {
            const res = await api.post('/reviews', { courseId: id, rating, comment });
            const { review: newReview, updated } = res.data;
            setReviews(prev => {
                if (updated) return prev.map(r => r.user?._id === user._id ? newReview : r);
                return [newReview, ...prev];
            });
            api.get(`/courses/${id}`).then(r => setCourse(r.data)).catch(() => { });
            toast.success(updated ? '⭐ Rating updated!' : '🎉 Thank you for your feedback!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit feedback');
        }
    };

    const saveNote = () => {
        if (!noteInput.trim()) return;
        setNotes(prev => [{ id: Date.now(), text: noteInput.trim(), timestamp: new Date().toLocaleTimeString() }, ...prev]);
        setNoteInput('');
    };

    const deleteNote = (noteId) => setNotes(prev => prev.filter(n => n.id !== noteId));

    const totalLessons = curriculum.reduce((acc, ch) => acc + (ch?.lessons?.length || 0), 0);

    if (isEnrolled && !isPlayerMode && user?.role === 'student' && !loading) {
        return <Navigate to={`/student/course/${id}/learn`} replace />;
    }

    if (!isEnrolled && isPlayerMode && user?.role === 'student' && !loading) {
        return <Navigate to={`/course/${id}`} replace />;
    }

    // --- ENROLLED VIEW (PLAYER) ---
    if (isEnrolled && isPlayerMode) {
        const completedLessons = enrollment?.completedLessons?.length || 0;
        const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        const renderVideo = () => {
            if (!currentVideo) return (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#fff', gap: '0.5rem' }}>
                    <Monitor size={36} style={{ opacity: 0.5 }} />
                    <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.8 }}>No lesson video available.</p>
                </div>
            );
            const isYoutube = currentVideo.includes('youtube.com') || currentVideo.includes('youtu.be');
            if (isYoutube) {
                let embedUrl = currentVideo.includes('watch?v=') ? currentVideo.replace('watch?v=', 'embed/') : currentVideo;
                return <iframe src={embedUrl} title="Course Player" className="lp-player-iframe" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />;
            }
            return <VideoPlayer src={currentVideo} onUpdateProgress={handleUpdateProgress} onDurationReceived={handleDurationReceived} onEnded={() => currentLesson && handleLessonComplete(currentLesson._id)} />;
        };

        return (<>
            <div className="lp-learning-layout">
                <div className="lp-main-container">
                    <div className="lp-unified-container">
                        <div className="lp-unified-header">
                            <div className="lp-unified-header-left">
                                <div>
                                    <h2 className="lp-unified-title">{course.title}</h2>
                                    <div style={{ marginTop: '0.3rem' }}>
                                        <StarRating rating={course.rating || 0} numReviews={course.numReviews || 0} readOnly={true} />
                                    </div>
                                </div>
                            </div>
                            <div className="lp-unified-header-right">
                                <div className="lp-progress-pill">
                                    <div className="lp-progress-track"><div className="lp-progress-fill" style={{ width: `${progressPct}%` }} /></div>
                                    <span className="lp-progress-label">{progressPct}% done</span>
                                </div>
                                <button onClick={() => setShowRatingModal(true)} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <Star size={13} fill="#fbbf24" color="#fbbf24" /> Rate Course
                                </button>
                            </div>
                        </div>

                        <div className="lp-unified-main">
                            <div className="lp-player-wrap" style={{ position: 'relative', overflow: 'hidden' }}>{renderVideo()}</div>
                            {currentLesson && (
                                <div className="lp-lesson-title">
                                    <PlayCircle size={18} color="var(--primary)" />
                                    <span>{currentLesson.title}</span>
                                </div>
                            )}

                            <div className="lp-tabs">
                                {['Overview', 'Curriculum', 'Quiz', 'Notes', 'Feedback', 'Certificate'].map(tab => (
                                    <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())} className={`lp-tab-btn${activeTab === tab.toLowerCase() ? ' active' : ''}`}>
                                        {tab}
                                        {tab === 'Notes' && notes.length > 0 && <span className="lp-tab-badge">{notes.length}</span>}
                                    </button>
                                ))}
                            </div>

                            <div className="lp-tab-content">
                                {activeTab === 'overview' && (
                                    <div className="lp-fade-in">
                                        <h3 className="lp-section-title">About this course</h3>
                                        <p className="lp-description" style={{ marginBottom: '2rem' }}>{course.description || 'No description available.'}</p>

                                        {/* What You'll Learn in Enrolled View */}
                                        {course.learningOutcomes?.length > 0 && (
                                            <div style={{ marginBottom: '2.5rem' }}>
                                                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text)' }}>What You'll Learn</h4>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                                                    {course.learningOutcomes.map((outcome, idx) => (
                                                        <div key={idx} style={{ display: 'flex', gap: '0.6rem', alignItems: 'start' }}>
                                                            <CheckCircle size={14} color="var(--primary)" style={{ marginTop: '3px', flexShrink: 0 }} />
                                                            <span style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: '1.4' }}>{outcome}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Requirements in Enrolled View */}
                                        {course.requirements?.length > 0 && (
                                            <div style={{ marginBottom: '2.5rem' }}>
                                                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text)' }}>Requirements</h4>
                                                <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    {course.requirements.map((req, idx) => (
                                                        <li key={idx} style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: '1.4' }}>{req}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {(() => {
                                            const totalSeconds = curriculum.reduce((acc, ch) => acc + (ch?.lessons || []).reduce((a, l) => a + (l?.duration || 0), 0), 0);
                                            const hrs = Math.floor(totalSeconds / 3600);
                                            const mins = Math.floor((totalSeconds % 3600) / 60);
                                            const instructorDisplay = course.instructorName || 'Expert Instructor';
                                            const instructorInitial = instructorDisplay[0].toUpperCase();
                                            return (
                                                <div className="lp-overview-grid">
                                                    <div className="lp-overview-card">
                                                        <h4 className="lp-card-label" style={{ marginBottom: '1.25rem' }}>Course Details</h4>
                                                        <div className="lp-detail-list">
                                                            <div className="lp-detail-row"><div className="lp-icon-box"><Clock size={16} strokeWidth={2.5} /></div><span>{hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`} total</span></div>
                                                            <div className="lp-detail-row"><div className="lp-icon-box" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><PlayCircle size={16} strokeWidth={2.5} /></div><span>{totalLessons} lessons</span></div>
                                                            <div className="lp-detail-row"><div className="lp-icon-box" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}><Award size={16} strokeWidth={2.5} /></div><span>Certificate on completion</span></div>
                                                        </div>
                                                    </div>
                                                    <div className="lp-overview-card">
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0' }}>
                                                            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.4rem' }}>{instructorInitial}</div>
                                                            <div><p style={{ fontWeight: '800', margin: 0 }}>{instructorDisplay}</p></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}

                                {activeTab === 'curriculum' && (
                                    <div className="lp-fade-in">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                                            <h3 className="lp-section-title" style={{ margin: 0 }}>Course Curriculum</h3>
                                            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{completedLessons}/{totalLessons} lessons completed</span>
                                        </div>
                                        <div className="lp-curriculum-list">
                                            {curriculum.map((chapter, i) => {
                                                const cid = chapter._id || `ch${i}`;
                                                const isExp = expandedChapters.has(cid);
                                                return (
                                                    <div key={cid} className="lp-chapter">
                                                        <button className="lp-chapter-header" onClick={() => toggleChapterExpand(cid)}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span className="lp-chapter-num">Ch {i + 1}</span><span className="lp-chapter-title">{chapter.title}</span></div>
                                                            <ChevronDown size={16} style={{ transition: 'transform 0.2s', transform: isExp ? 'rotate(180deg)' : 'none' }} />
                                                        </button>
                                                        {isExp && (
                                                            <div className="lp-chapter-lessons">
                                                                {chapter.lessons?.map((lesson, j) => {
                                                                    const lessonId = lesson._id?.toString();
                                                                    const isActive = currentLesson?._id?.toString() === lessonId;
                                                                    const isDone = (enrollment?.completedLessons || []).some(cl => (cl._id?.toString() || cl.toString()) === lessonId);
                                                                    return (
                                                                        <div key={lessonId || j} className={`lp-lesson-row${isActive ? ' active' : ''}`} onClick={() => handleLessonClick(lesson)}>
                                                                            <div className={`lp-lesson-check${isDone ? ' done' : ''}`} onClick={(e) => { e.stopPropagation(); handleLessonComplete(lesson._id); }}>
                                                                                {isDone ? <CheckCircle size={13} /> : <PlayCircle size={13} />}
                                                                            </div>
                                                                            <span className="lp-lesson-name">{lesson?.title || 'Untitled Lesson'}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'quiz' && (
                                    <div className="lp-fade-in" style={{ padding: '0.5rem 0' }}>
                                        {!quizData ? (
                                            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                                                <BookOpen size={40} style={{ opacity: 0.15, marginBottom: '1rem' }} />
                                                <p>No quiz available for this course yet.</p>
                                            </div>
                                        ) : (
                                            <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                                    <div><h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{quizData.title}</h3><p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pass with 70% to unlock certificate</p></div>
                                                    {enrollment && <div style={{ textAlign: 'right' }}><span style={{ fontSize: '0.8rem' }}>Attempts: {enrollment.quizAttempts || 0}/3</span><div style={{ fontWeight: 700, color: 'var(--primary)' }}>Best: {Math.round(enrollment.bestQuizScore || 0)}%</div></div>}
                                                </div>
                                                {quizResult ? (
                                                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                                        <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: quizResult.passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: quizResult.passed ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>{quizResult.passed ? <CheckCircle size={40} /> : <X size={40} />}</div>
                                                        <h4 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{quizResult.passed ? 'Excellent Work!' : 'Almost There!'}</h4>
                                                        <p style={{ marginBottom: '1.5rem' }}>You scored <strong>{Math.round(quizResult.score)}%</strong>.</p>
                                                        <button onClick={() => setQuizResult(null)} className="btn btn-ghost">{quizResult.attemptsUsed < 3 && !quizResult.passed ? 'Try Again' : 'Review Results'}</button>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                                        {quizData.questions.map((q, qIdx) => (
                                                            <div key={qIdx} style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '12px' }}>
                                                                <p style={{ fontWeight: 700, marginBottom: '1rem' }}>{qIdx + 1}. {q.questionText}</p>
                                                                <div style={{ display: 'grid', gap: '0.75rem' }}>
                                                                    {q.options.map((opt, oIdx) => (
                                                                        <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid', borderColor: quizAnswers[qIdx] === oIdx ? 'var(--primary)' : 'var(--border)', cursor: 'pointer' }}>
                                                                            <input type="radio" name={`q-${qIdx}`} checked={quizAnswers[qIdx] === oIdx} onChange={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: oIdx }))} />
                                                                            <span style={{ fontSize: '0.9rem' }}>{opt}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <button className="btn btn-primary" onClick={handleQuizSubmit} disabled={submittingQuiz || (enrollment?.quizAttempts >= 3 && enrollment?.bestQuizScore < 70)} style={{ alignSelf: 'center', padding: '0.8rem 3rem' }}>{submittingQuiz ? 'Submitting...' : 'Submit Quiz'}</button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'notes' && (
                                    <div className="lp-fade-in">
                                        {/* Notes Input Card */}
                                        <div style={{
                                            border: '1px solid var(--border)',
                                            borderRadius: '12px',
                                            backgroundColor: 'var(--surface)',
                                            padding: '1.5rem',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                            marginBottom: '1.5rem'
                                        }}>
                                            <h3 className="lp-section-title" style={{ marginTop: 0, marginBottom: '1rem' }}>My Notes</h3>
                                            <textarea className="lp-notes-textarea" placeholder="Write a note..." value={noteInput} onChange={e => setNoteInput(e.target.value)} rows={5} style={{ marginBottom: '1rem' }} />
                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <button className="btn btn-primary" onClick={saveNote}>Save Note</button>
                                            </div>
                                        </div>
                                        {/* Saved Notes List */}
                                        <div>
                                            {notes.map(n => (
                                                <div key={n.id} className="lp-note-item"><div style={{ flex: 1 }}><p>{n.text}</p><p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{n.timestamp}</p></div><button onClick={() => deleteNote(n.id)}><X size={16} /></button></div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'feedback' && (
                                    <div className="lp-fade-in">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <h3 style={{ margin: 0 }}>Student Feedback</h3>
                                            <button onClick={() => setShowRatingModal(true)} className="btn btn-primary">Write a Review</button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {reviews.map((r, i) => (
                                                <div key={r._id || i} style={{ padding: '1.1rem', border: '1px solid var(--border)', borderRadius: '12px' }}>
                                                    <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '0.6rem' }}>
                                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{(r.user?.name || 'U')[0]}</div>
                                                        <div style={{ flex: 1 }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{r.user?.name}</strong><span style={{ fontSize: '0.75rem' }}>{new Date(r.createdAt).toLocaleDateString()}</span></div><StarRating rating={r.rating} readOnly /></div>
                                                    </div>
                                                    <p style={{ fontSize: '0.88rem', margin: 0 }}>{r.comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'certificate' && (
                                    <div className="lp-fade-in">
                                        <div className="lp-certificate-card">
                                            <Award size={36} color="var(--primary)" />
                                            <h3>Course Certificate</h3>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Complete lessons and pass quiz (70%+) to earn your certificate.</p>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1.5rem 0' }}>
                                                <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.02)' }}><div>Progress</div><strong>{progressPct}%</strong></div>
                                                <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.02)' }}><div>Quiz</div><strong>{Math.round(enrollment?.bestQuizScore || 0)}%</strong></div>
                                            </div>
                                            {progressPct === 100 && (enrollment?.bestQuizScore >= 70) ? (
                                                <button
                                                    onClick={handleDownloadCertificate}
                                                    disabled={downloadingCert}
                                                    className="btn btn-primary"
                                                    style={{ width: '100%' }}
                                                >
                                                    {downloadingCert ? 'Generating...' : 'Download Certificate'}
                                                </button>
                                            ) : (
                                                <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(0,0,0,0.03)', fontSize: '0.85rem' }}><Lock size={14} /> Locked — Pass the quiz and complete all lessons.</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <aside className="lp-outer-sidebar">
                    <div className="lp-sidebar-card">
                        <h4 className="lp-sidebar-card-title"><CheckCircle size={15} color="var(--primary)" /> Your Progress</h4>
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}><span>Overall</span><strong>{progressPct}%</strong></div>
                            <div style={{ height: 6, background: 'var(--border)', borderRadius: 100, overflow: 'hidden' }}><div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.4s ease' }} /></div>
                        </div>
                        {[
                            { label: 'Lessons', value: `${completedLessons} / ${totalLessons}` },
                            { label: 'Chapters', value: `${curriculum.length} total` },
                            {
                                label: 'Time Spent', value: (() => {
                                    const secs = enrollment?.timeSpent || 0;
                                    const h = Math.floor(secs / 3600);
                                    const m = Math.floor((secs % 3600) / 60);
                                    return h > 0 ? `${h}h ${m}m` : `${m}m`;
                                })()
                            },
                        ].map(({ label, value }) => (
                            <div key={label} className="lp-stat-row"><span>{label}</span><strong>{value}</strong></div>
                        ))}
                    </div>

                    <div className="lp-sidebar-card">
                        <h4 className="lp-sidebar-card-title"><BookOpen size={15} color="var(--primary)" /> Resources</h4>
                        <p style={{ fontSize: '0.82rem' }}>{course.resources?.length > 0 ? (
                            <ul style={{ listStyle: 'none', padding: 0 }}>{course.resources.map((res, i) => (<li key={i}><a href={res.url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>{res.title}</a></li>))}</ul>
                        ) : "No resources available."}</p>
                    </div>

                    <div className="lp-sidebar-card lp-nav-card">
                        <div style={{ padding: '0 0.5rem 0.75rem' }}><h4 className="lp-sidebar-card-title"><PlayCircle size={15} color="var(--primary)" /> Course Content</h4></div>
                        <div className="lp-nav-list">
                            {curriculum.map((chapter, i) => {
                                const cid = chapter._id || `ch${i}`;
                                const isExp = expandedChapters.has(cid);
                                return (
                                    <div key={cid} className="lp-nav-chapter">
                                        <button className="lp-nav-chapter-header" onClick={() => toggleChapterExpand(cid)}><span>{i + 1}. {chapter.title}</span><ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: isExp ? 'rotate(180deg)' : 'none' }} /></button>
                                        {isExp && (
                                            <div>
                                                {chapter?.lessons?.map((lesson, j) => {
                                                    const lessonId = lesson?._id?.toString();
                                                    const isActive = currentLesson?._id?.toString() === lessonId;
                                                    const isDone = (enrollment?.completedLessons || []).some(cl => (cl._id?.toString() || cl.toString()) === lessonId);
                                                    return (
                                                        <div key={lessonId || j} onClick={() => handleLessonClick(lesson)} className={`lp-nav-lesson${isActive ? ' active' : ''}`}>
                                                            <div className="lp-lesson-left">{isDone ? <CheckCircle size={14} color="#10b981" /> : <PlayCircle size={14} />}<strong>{lesson?.title}</strong></div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </aside>
            </div>

            {showRatingModal && (
                <RatingModal
                    isOpen={showRatingModal}
                    onClose={() => setShowRatingModal(false)}
                    onSubmit={submitFeedback}
                    courseTitle={course.title}
                    initialRating={myRating.rating}
                    initialComment={myRating.comment}
                />
            )}
        </>);
    }
    else {
        // --- SALES VIEW (NOT ENROLLED) ---
        return (
            <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh', paddingBottom: '5rem', overflowX: 'hidden' }}>
                {/* 1. Full-Width Dark Banner Header */}
                <div style={{ backgroundColor: '#2f3b52', color: '#fff', paddingTop: isMobile ? '2rem' : '2.5rem', paddingBottom: isMobile ? '2rem' : '2.5rem', marginBottom: '1.5rem', width: '100%' }}>
                    <div className="container" style={{ maxWidth: isMobile ? '800px' : '1200px', margin: '0 auto', padding: isMobile ? '0 1.25rem' : '0' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxWidth: '800px' }}>
                            <h1 style={{ fontSize: '2.1rem', fontWeight: '800', lineHeight: '1.2', margin: 0, color: '#fff' }}>{course.title}</h1>
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

                    {/* Left Column: Learning Info & Unified Content Block */}
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
                            <section>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text)' }}>What You'll Learn</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '0.75rem' : '1rem' }}>
                                    {(course.learningOutcomes && course.learningOutcomes.length > 0 ? course.learningOutcomes : ['Master the core concepts', 'Build real-world projects', 'Learn industry best practices']).map((outcome, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                                            <CheckCircle size={16} color="#22c55e" style={{ marginTop: '4px', flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: '1.4' }}>{outcome}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <div style={{ borderTop: '1px solid var(--border)', opacity: 0.6 }} />

                            {/* Section B: Requirements */}
                            <section>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text)' }}>Requirements</h2>
                                <ul style={{ margin: 0, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    {(course.requirements && course.requirements.length > 0 ? course.requirements : ['Basic understanding of the subject', 'Interest in learning', 'Access to a computer and internet']).map((req, idx) => (
                                        <li key={idx} style={{ fontSize: '0.95rem', color: 'var(--text)', lineHeight: '1.4' }}>{req}</li>
                                    ))}
                                </ul>
                            </section>

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
                                                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'column', alignItems: 'stretch', gap: '0.15rem', flex: 1, minWidth: 0 }}>
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
                                                                borderBottom: j < chapter.lessons.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                                                            }}>
                                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', minWidth: 0 }}>
                                                                    <PlayCircle size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                                                    <span style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: '1.5' }}>{lesson.title}</span>
                                                                </div>
                                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flexShrink: 0, marginTop: '4px' }}>05:24</span>
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

                    {/* Right Column: Purchase Card */}
                    <div style={{ position: 'relative', order: isMobile ? 1 : 2, width: '100%' }}>
                        <div style={{
                            position: isMobile ? 'static' : 'sticky',
                            top: isMobile ? '0' : '2rem',
                            backgroundColor: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                            zIndex: 100,
                            maxWidth: isMobile ? '100%' : '350px',
                            margin: isMobile ? '0 auto 2rem' : '0',
                            width: '100%',
                            boxSizing: 'border-box'
                        }}>
                            {/* Video Preview */}
                            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', backgroundColor: '#000' }}>
                                {showPreview ? (
                                    course.videoUrl?.includes('youtube.com') || course.videoUrl?.includes('youtu.be') ? (
                                        <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: '12px', overflow: 'hidden' }}>
                                            <iframe
                                                src={course.videoUrl.replace('watch?v=', 'embed/')}
                                                title="Preview"
                                                allow="autoplay; encrypted-media"
                                                allowFullScreen
                                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                            />
                                        </div>
                                    ) : (
                                        <video src={course.videoUrl} controls autoPlay style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
                                    )
                                ) : (
                                    <div style={{ position: 'relative', width: '100%', height: '100%', cursor: 'pointer' }} onClick={() => setShowPreview(true)}>
                                        <img src={course.thumbnailUrl || course.thumbnail} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                                            <div style={{
                                                width: isMobile ? 48 : 64,
                                                height: isMobile ? 48 : 64,
                                                backgroundColor: 'rgba(255,255,255,0.95)',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                                                transition: 'transform 0.2s ease'
                                            }}>
                                                <Play size={isMobile ? 24 : 32} fill="#1c1d1f" color="#1c1d1f" style={{ marginLeft: isMobile ? '3px' : '4px' }} />
                                            </div>
                                        </div>
                                        <div style={{ position: 'absolute', bottom: isMobile ? '0.85rem' : '1.25rem', width: '100%', textAlign: 'center', color: '#fff', fontWeight: '800', fontSize: isMobile ? '0.8rem' : '0.95rem', textShadow: '0 2px 8px rgba(0,0,0,0.9)', zIndex: 2 }}>Preview this course</div>
                                    </div>
                                )}
                            </div>

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
                                    {user ? 'Enroll Now' : 'Login to Enroll'}
                                </button>

                                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', wordBreak: 'break-word' }}>
                                    30-Day Money-Back Guarantee
                                </p>

                                <div style={{ borderTop: '1px solid var(--border)', margin: '1.5rem 0', opacity: 0.6 }} />

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>This course includes:</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text)' }}>
                                        {(() => {
                                            const salesCurriculum = (course.chapters || []).filter(Boolean);
                                            const totalSeconds = salesCurriculum.reduce((acc, ch) => acc + (ch?.lessons || []).reduce((a, l) => a + (l?.duration || 0), 0), 0);
                                            const hrs = Math.floor(totalSeconds / 3600);
                                            const mins = Math.floor((totalSeconds % 3600) / 60);
                                            return (
                                                <>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}><Monitor size={16} /> <span>Access on mobile and TV</span></div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}><Infinity size={16} /> <span>Full lifetime access</span></div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}><Award size={16} /> <span>Certificate of completion</span></div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};

class CourseDetailErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("CourseDetail rendering error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '2rem', textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <X size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Something went wrong.</h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: '1.5rem' }}>We encountered an error loading this course page. Please try refreshing.</p>

                    <div style={{ textAlign: 'left', backgroundColor: '#f871711a', color: '#b91c1c', padding: '1rem', borderRadius: '8px', maxWidth: '800px', width: '100%', marginBottom: '1.5rem', overflow: 'auto', maxHeight: '400px', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        <strong>{this.state.error && this.state.error.toString()}</strong>
                        <br /><br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </div>

                    <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Reload Page</button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function SafeCourseDetail(props) {
    return (
        <CourseDetailErrorBoundary>
            <CourseDetail {...props} />
        </CourseDetailErrorBoundary>
    );
}
