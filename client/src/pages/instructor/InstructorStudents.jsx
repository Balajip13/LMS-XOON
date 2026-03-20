import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Mail, Calendar, Filter, Loader2, Users, MoreVertical, ExternalLink, UserCheck, BookOpen, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const InstructorStudents = () => {
    const { api } = useAuth();
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);

    // Filters & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [totalStudents, setTotalStudents] = useState(0);

    useEffect(() => {
        // Debounce search slightly
        const t = setTimeout(() => {
            fetchStudents(page);
        }, 300);
        return () => clearTimeout(t);
    }, [page, searchTerm, selectedCourse]);

    const fetchStudents = async (pageNumber = 1) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/instructor/students?pageNumber=${pageNumber}&courseId=${selectedCourse}&keyword=${searchTerm}`);
            if (data.success) {
                setStudents(data.data);
                setCourses(data.courses);
                setPages(data.pages);
                setTotalStudents(data.totalStudents);
            }
        } catch (error) {
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="instructor-page-container">
            <div className="instructor-page-header parallel-header">
                <div className="header-left">
                    <h1 className="instructor-page-title">Enrolled Students</h1>
                    <p className="instructor-page-subtitle">Track student progress and manage enrollments</p>
                </div>
                <div className="header-right">
                    <div className="stat-card-header shadow-sm animate-fade-in">
                        <div className="stat-card-header-icon">
                            <UserCheck size={20} />
                        </div>
                        <div className="stat-card-header-info">
                            <span className="stat-header-label">Total Enrolled</span>
                            <span className="stat-header-value">{totalStudents} Students</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="card students-filter-bar shadow-soft">
                <div className="search-input-group">
                    <Search className="search-icon-inside" size={18} />
                    <input
                        type="text"
                        className="modern-search-input"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-select-group">
                    <div className="filter-icon-wrapper">
                        <Filter size={16} />
                    </div>
                    <select
                        className="modern-select"
                        value={selectedCourse}
                        onChange={(e) => { setSelectedCourse(e.target.value); setPage(1); }}
                    >
                        <option value="">All Courses</option>
                        {courses.map(c => (
                            <option key={c._id} value={c._id}>{c.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Students Table */}
            <div className="students-list-container">
                {loading && students.length === 0 ? (
                    <div className="card flex-center py-12">
                        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                    </div>
                ) : students.length === 0 ? (
                    <div className="card modern-empty-state">
                        <div className="empty-state-illustration">
                            <div className="illustration-circle">
                                <Users size={48} className="text-muted" />
                            </div>
                        </div>
                        <h3 className="empty-state-title">No students found</h3>
                        <p className="empty-state-subtitle">Adjust your filters or try a different search term to find what you're looking for.</p>
                        <div className="empty-state-actions">
                            <button className="btn btn-primary" onClick={() => { setSearchTerm(''); setSelectedCourse(''); }}>
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Desktop View Table */}
                        <div className="card table-card-modern hide-mobile">
                            <div className="table-responsive-wrapper">
                                <table className="modern-saas-table">
                                    <thead>
                                        <tr>
                                            <th>Student Information</th>
                                            <th>Course Enrolled</th>
                                            <th>Enrollment Date</th>
                                            <th>Learning Progress</th>
                                            <th className="text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student) => (
                                            <tr key={`${student.id}-${student.course}`} className="hover-row">
                                                <td>
                                                    <div className="student-profile-summary">
                                                        <div className="student-avatar-modern">
                                                            {student.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="student-details">
                                                            <div className="student-name-semibold">{student.name}</div>
                                                            <div className="student-email-muted">
                                                                <Mail size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                                                {student.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="modern-course-badge">
                                                        {student.course}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="modern-date-text">
                                                        <Calendar size={14} className="text-muted" />
                                                        {new Date(student.enrollmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="modern-progress-box">
                                                        <div className="progress-label-row">
                                                            <span className="progress-percentage">{student.progress || 0}%</span>
                                                            <span className={`status-dot ${student.isCompleted ? 'completed' : 'active'}`}></span>
                                                        </div>
                                                        <div className="modern-progress-track">
                                                            <div
                                                                className="modern-progress-fill"
                                                                style={{
                                                                    width: `${student.progress || 0}%`,
                                                                    backgroundColor: student.isCompleted ? '#10b981' : '#3b82f6'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-right">
                                                    <button className="icon-btn-ghost" title="More Actions">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile View Grid */}
                        <div className="student-mobile-grid show-mobile">
                            {students.map((student) => (
                                <div key={`${student.id}-${student.course}-mob`} className="student-mobile-card">
                                    <div className="mobile-card-header">
                                        <div className="mobile-student-info">
                                            <div className="student-avatar-modern sm">
                                                {student.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="mobile-student-name">{student.name}</div>
                                                <div className="mobile-student-email">{student.email}</div>
                                            </div>
                                        </div>
                                        <button className="icon-btn-ghost">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                    <div className="mobile-card-body">
                                        <div className="mobile-info-row">
                                            <span className="mobile-info-label">Course:</span>
                                            <span className="mobile-info-value">{student.course}</span>
                                        </div>
                                        <div className="mobile-info-row">
                                            <span className="mobile-info-label">Joined:</span>
                                            <span className="mobile-info-value">{new Date(student.enrollmentDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="mobile-progress-section">
                                            <div className="progress-header">
                                                <span>Progress</span>
                                                <span>{student.progress || 0}%</span>
                                            </div>
                                            <div className="modern-progress-track sm">
                                                <div
                                                    className="modern-progress-fill"
                                                    style={{
                                                        width: `${student.progress || 0}%`,
                                                        backgroundColor: student.isCompleted ? '#10b981' : '#3b82f6'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Pagination */}
            {pages > 1 && (
                <div className="pagination-container" style={{ marginTop: '2rem' }}>
                    <div className="pagination-stats">
                        Showing page <strong>{page}</strong> of <strong>{pages}</strong> ({totalStudents} total)
                    </div>
                    <div className="pagination-buttons">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="btn btn-outline btn-sm"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(pages, p + 1))}
                            disabled={page === pages}
                            className="btn btn-outline btn-sm"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

};

export default InstructorStudents;
