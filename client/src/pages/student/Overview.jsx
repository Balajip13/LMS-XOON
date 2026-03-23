import { useState, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
    BookOpen,
    CheckCircle,
    Clock,
    Award,
    Search,
    ArrowRight,
    PlayCircle,
    Bell,
    Calendar,
    Activity,
    Lightbulb
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MetricCard = ({ title, value, icon: Icon, color }) => (
    <div style={{
        backgroundColor: 'var(--surface)',
        padding: '1.5rem',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        boxShadow: 'var(--shadow-sm)'
    }}>
        <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: `${color}10`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        }}>
            <Icon size={24} />
        </div>
        <div>
            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)' }}>{value}</h3>
        </div>
    </div>
);

const Overview = () => {
    const { user } = useAuth();
    const { courses = [], announcements = [], certificates = [] } = useOutletContext();
    const [searchQuery, setSearchQuery] = useState('');

    // Filter courses based on search query
    const filteredCourses = useMemo(() => {
        if (!searchQuery.trim()) return courses;
        const query = searchQuery.toLowerCase();
        return courses.filter(c =>
            c.title?.toLowerCase().includes(query) ||
            c.category?.name?.toLowerCase().includes(query) || c.category?.toLowerCase().includes(query)
        );
    }, [courses, searchQuery]);

    // Derived metrics
    // A course is complete if progress is 100, isCompleted is true, or they have a certificate for it.
    const completedCourses = courses.filter(c => {
        const hasCertificate = certificates.some(cert => cert.course?._id === c._id || cert.course === c._id);
        return (c.progress || 0) === 100 || c.isCompleted || hasCertificate;
    });

    const inProgressCourses = courses.filter(c => {
        const hasCertificate = certificates.some(cert => cert.course?._id === c._id || cert.course === c._id);
        const progress = c.progress || 0;
        const isCompleted = c.isCompleted || progress === 100 || hasCertificate;
        return progress > 0 && !isCompleted;
    });

    const totalEnrolled = courses.length;

    // Latest active course for "Continue Learning"
    // Only pull from courses that are NOT fully completed
    const latestCourse = courses
        .filter(c => {
            const hasCertificate = certificates.some(cert => cert.course?._id === c._id || cert.course === c._id);
            return (c.progress || 0) < 100 && !c.isCompleted && !hasCertificate;
        })
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];

    return (
        <div className="animate-in fade-in duration-500" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
            {/* Instructor Application Status Banner */}
            {user?.instructorRequestStatus === 'pending' && (
                <div style={{
                    backgroundColor: '#fff7ed',
                    border: '1px solid #ffedd5',
                    borderRadius: '16px',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '0.5rem'
                }}>
                    <div style={{ backgroundColor: '#fed7aa', padding: '0.5rem', borderRadius: '10px', color: '#ea580c' }}>
                        <Clock size={20} />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#9a3412' }}>Instructor Application Under Review</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#c2410c' }}>We're currently reviewing your application. You'll be notified once a decision is made.</p>
                    </div>
                </div>
            )}

            {/* Header & Search */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text)', marginBottom: '0.5rem' }}>
                        Welcome back, {user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                        Here's what's happening with your learning today.
                    </p>
                </div>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search your courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 2.75rem',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--surface)',
                            outline: 'none',
                            fontSize: '0.9rem'
                        }}
                        className="search-input"
                    />
                </div>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <MetricCard title="Enrolled" value={totalEnrolled} icon={BookOpen} color="#3b82f6" />
                <MetricCard title="In Progress" value={inProgressCourses.length} icon={Clock} color="#f59e0b" />
                <MetricCard title="Completed" value={completedCourses.length} icon={CheckCircle} color="#10b981" />
                <MetricCard title="Deadlines" value="0" icon={Calendar} color="#ef4444" />
            </div>

            {/* If Search Query exists, show search results */}
            {searchQuery.trim() && (
                <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Search size={20} color="var(--primary)" />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Search Results</h2>
                    </div>
                    {filteredCourses.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                            {filteredCourses.map((c, idx) => (
                                <Link key={idx} to={`/course/${c._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px', backgroundColor: 'var(--surface-hover)' }}>
                                        <p style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem' }}>{c.title}</p>
                                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Progress: {c.progress}%</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>No courses matching "{searchQuery}"</p>
                    )}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }} className="overview-content-grid">
                {/* Left Side: Summary & Activity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    {/* Continue Learning Action Card */}
                    {latestCourse && (
                        <div style={{
                            backgroundColor: '#1e3a8a',
                            borderRadius: '24px',
                            padding: '1.25rem 2rem',
                            color: '#ffffff',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 4px 15px rgba(30, 58, 138, 0.3)'
                        }}>
                            <div style={{ position: 'relative', zIndex: 2 }}>
                                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#ffffff' }}>Recently Accessed</span>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0.5rem 0 0.25rem 0', color: '#ffffff' }}>{latestCourse.title}</h2>
                                <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '1.25rem', color: '#ffffff' }}>You've completed {latestCourse.progress}% of this course. Great job!</p>
                                <Link to={`/course/${latestCourse._id}`} className="btn" style={{ backgroundColor: '#ffffff', color: '#1e3a8a', fontWeight: '700', padding: '0.6rem 1.5rem', borderRadius: '12px', fontSize: '0.85rem', display: 'inline-block' }}>
                                    Continue Learning
                                </Link>
                            </div>
                            <PlayCircle size={140} style={{ position: 'absolute', right: '-30px', bottom: '-20px', opacity: 0.1, color: '#ffffff' }} />
                        </div>
                    )}

                    {/* Recent Activity */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <Activity size={20} color="var(--primary)" />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Recent Activity</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {courses.length > 0 ? courses.slice(0, 3).map((c, idx) => (
                                <div key={idx} style={{ padding: '1.25rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: idx === 0 ? 'var(--primary)' : 'var(--border)' }} />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600' }}>Updated progress in {c.title}</p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(c.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)' }}>+{c.progress}%</span>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px dotted var(--border)' }}>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>No recent activity to show. <Link to="/student/courses" style={{ color: 'var(--primary)', fontWeight: 600 }}>Browse Courses</Link></p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Announcements & Tips */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Announcements */}
                    <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <Bell size={20} color="var(--primary)" />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Announcements</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {announcements.length > 0 ? announcements.slice(0, 3).map((ann, idx) => (
                                <div key={idx} style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
                                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.2rem' }}>{ann.title}</p>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{ann.message}</p>
                                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '600' }}>{ann.course?.title} • {new Date(ann.createdAt).toLocaleDateString()}</p>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>No announcements for your courses.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Learning Tips Card */}
                    <div style={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '24px',
                        padding: '2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Lightbulb size={20} color="#f59e0b" />
                            <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>Daily Tip</h3>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                            {[
                                "Consistency is key. Studying for just 30 minutes every day is more effective than marathon sessions.",
                                "Take breaks! The Pomodoro technique (25m study, 5m break) helps maintain focus.",
                                "Teach what you learn. Explaining concepts to others is the best way to master them.",
                                "Apply what you learn immediately. Build a small project after each chapter."
                            ][Math.floor(Date.now() / 86400000) % 4]}
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                .search-input:focus {
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 0 3px var(--primary-light) !important;
                }
                @media (max-width: 1100px) {
                    .overview-content-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Overview;
