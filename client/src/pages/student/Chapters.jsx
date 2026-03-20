import { useState } from 'react';
import { BookOpen, PlayCircle, FileText, CheckCircle, ChevronRight, Clock } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Chapters = ({ enrollments = [] }) => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const courseId = queryParams.get('courseId');

    // Find the currently selected course from enrollments
    const activeEnrollment = enrollments.find(e => e.course?._id === courseId) || enrollments[0];
    const selectedCourse = activeEnrollment?.course;

    if (!selectedCourse) {
        return (
            <div style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', padding: '6rem 2rem', textAlign: 'center' }}>
                <PlayCircle size={64} style={{ opacity: 0.1, marginBottom: '1.5rem', margin: '0 auto' }} color="var(--text)" />
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>No course selected</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '400px', margin: '0 auto' }}>Select a course from your library to start learning.</p>
            </div>
        );
    }

    // Chapters would typically come from course.modules or course.lessons
    const modules = selectedCourse.modules || [];

    return (
        <div className="animate-in fade-in duration-500" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingBottom: '2rem' }}>
            <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text)', marginBottom: '0.5rem' }}>Chapters & Lessons</h1>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Track your progress through modules and assignments.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }} className="chapters-grid">
                {/* Left Side: Module List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {modules.length > 0 ? modules.map((module, idx) => (
                        <div key={idx} style={{
                            backgroundColor: 'var(--surface)',
                            borderRadius: '16px',
                            border: '1px solid var(--border)',
                            padding: '1.5rem',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Module {idx + 1}: {module.title}</h3>
                                <div style={{ padding: '0.35rem 0.75rem', borderRadius: '100px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.75rem', fontWeight: '700' }}>
                                    Completed
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {module.lessons?.map((lesson, lIdx) => (
                                    <div key={lIdx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '10px', backgroundColor: 'var(--surface-hover)' }}>
                                        <PlayCircle size={18} color="var(--primary)" />
                                        <span style={{ fontSize: '0.9rem', fontWeight: '600', flex: 1 }}>{lesson.title}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{lesson.duration}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )) : (
                        <div style={{
                            backgroundColor: 'var(--surface)',
                            borderRadius: '16px',
                            border: '1px solid var(--border)',
                            padding: '4rem 2rem',
                            textAlign: 'center'
                        }}>
                            <BookOpen size={48} style={{ opacity: 0.1, marginBottom: '1rem', margin: '0 auto' }} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Lesson content coming soon</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '300px', margin: '0 auto' }}>
                                The instructor is currently preparing the lessons for this course.
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Side: Course Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                            <img src={selectedCourse.thumbnail} alt={selectedCourse.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>{selectedCourse.title}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Progress</span>
                                <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{activeEnrollment.progress}%</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--surface-hover)', borderRadius: '100px', overflow: 'hidden' }}>
                                <div style={{ width: `${activeEnrollment.progress}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '100px' }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--surface-hover)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700' }}>Assignment Status</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <FileText size={18} color="var(--primary)" />
                            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>2/4 Submitted</span>
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem' }}>
                            View Assignments
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .chapters-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Chapters;
