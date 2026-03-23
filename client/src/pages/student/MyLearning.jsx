import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, ArrowRight, Star, CheckCircle, Clock, Search, LayoutGrid } from 'lucide-react';
import StudentCourseList from './StudentCourseList';

const MyLearning = ({ courses = [] }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCourses = courses.filter(course =>
        !searchQuery.trim() || course?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="animate-in fade-in duration-500" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header Row */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text)', marginBottom: '0.5rem' }}>Continue Learning</h1>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Pick up right where you left off from your enrolled courses.</p>
                    </div>
                    <Link
                        to="/student/courses"
                        className="btn btn-outline"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', flexShrink: 0 }}
                    >
                        <LayoutGrid size={16} /> Explore Courses
                    </Link>
                </div>

                {/* Search Bar */}
                {courses.length > 0 && (
                    <div style={{ position: 'relative', maxWidth: '480px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                        <input
                            type="text"
                            placeholder="Search your courses..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.65rem 1rem 0.65rem 2.5rem',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                backgroundColor: 'var(--surface)',
                                color: 'var(--text)',
                                fontSize: '0.9rem',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={e => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>
                )}
            </div>

            {filteredCourses.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                    {filteredCourses.map((course) => {
                        if (!course) return null;
                        const progress = course.progress || 0;
                        const isCompleted = course.isCompleted || progress === 100;

                        return (
                            <div key={course.enrollmentId || course._id} style={{
                                backgroundColor: 'var(--surface)',
                                borderRadius: '16px',
                                border: '1px solid var(--border)',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: 'var(--shadow-sm)',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }} className="course-card-hover">
                                <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                                    <Link to={`/student/course/${course?._id}/learn`}>
                                        <img
                                            src={course.thumbnail || '/placeholder.jpg'}
                                            alt={course.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </Link>
                                    <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                                        {isCompleted ? (
                                            <span style={{
                                                backgroundColor: 'var(--success)',
                                                color: 'white',
                                                padding: '0.35rem 0.75rem',
                                                borderRadius: '100px',
                                                fontSize: '0.7rem',
                                                fontWeight: '700',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem'
                                            }}>
                                                <CheckCircle size={12} /> Completed
                                            </span>
                                        ) : (
                                            <span style={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                color: 'var(--text)',
                                                padding: '0.35rem 0.75rem',
                                                borderRadius: '100px',
                                                fontSize: '0.7rem',
                                                fontWeight: '700',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                backdropFilter: 'blur(4px)'
                                            }}>
                                                <Clock size={12} /> In Progress
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div>
                                        <Link to={`/student/course/${course?._id}/learn`} style={{ textDecoration: 'none' }}>
                                            <h3 style={{
                                                fontSize: '1.1rem',
                                                fontWeight: '700',
                                                margin: '0 0 0.4rem 0',
                                                color: 'var(--text)',
                                                display: '-webkit-box',
                                                WebkitBoxOrient: 'vertical',
                                                WebkitLineClamp: 1,
                                                overflow: 'hidden'
                                            }}>{course.title}</h3>
                                        </Link>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {course.instructor?.name || 'XOON Instructor'}
                                        </p>
                                    </div>

                                    {/* Progress Bar */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.4rem' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>Course Progress</span>
                                            <span style={{ color: 'var(--primary)' }}>{progress}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--surface-hover)', borderRadius: '100px', overflow: 'hidden' }}>
                                            <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '100px' }} />
                                        </div>
                                    </div>

                                    {/* Action Area */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                                        <Link
                                            to={`/student/course/${course?._id}/learn`}
                                            className="btn btn-primary"
                                            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                        >
                                            {isCompleted ? 'Review Course' : 'Resume'} <ArrowRight size={16} />
                                        </Link>
                                        {isCompleted && (
                                            <button
                                                className="btn btn-outline"
                                                style={{ padding: '0.75rem', borderRadius: '8px', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                                            >
                                                <Star size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', padding: '5rem 2rem', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--surface-hover)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--text-muted)', opacity: 0.5 }}>
                        <BookOpen size={40} />
                    </div>
                    {searchQuery.trim() ? (
                        <>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>No Results Found</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>No enrolled courses match "{searchQuery}". Try a different search term.</p>
                            <button
                                className="btn btn-outline"
                                onClick={() => setSearchQuery('')}
                                style={{ padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: '600' }}
                            >
                                Clear Search
                            </button>
                        </>
                    ) : (
                        <>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>No Enrolled Courses</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>You haven't enrolled in any courses yet. Discover our catalog and start learning today!</p>
                            <Link
                                to="/student/courses"
                                className="btn btn-primary"
                                style={{ padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: '600', display: 'inline-block', textDecoration: 'none' }}
                            >
                                Browse Our Catalog
                            </Link>
                        </>
                    )}
                </div>
            )}

            <style>{`
                .course-card-hover:hover {
                    box-shadow: var(--shadow-lg) !important;
                    transform: translateY(-4px);
                }
            `}</style>
        </div>
    );
};

export default MyLearning;

