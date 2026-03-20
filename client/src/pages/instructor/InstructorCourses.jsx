import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Loader2, Edit, Trash2, Eye, Plus, BookOpen, Star, IndianRupee, Users, ClipboardList, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const InstructorCourses = () => {
    const { api } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);

    // Pagination & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);

    useEffect(() => {
        const t = setTimeout(() => fetchCourses(page), 300);
        return () => clearTimeout(t);
    }, [page, searchTerm]);

    const fetchCourses = async (pageNumber = 1) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/instructor/courses?pageNumber=${pageNumber}&keyword=${searchTerm}`);
            // Note: Since we are using the public getCourses endpoint that conditionally filters by instructor on backend, 
            // the response is { courses, page, pages } directly.
            setCourses(data.courses || []);
            setPages(data.pages || 1);
        } catch (error) {
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course? This action is permanent and will remove all related content.')) return;

        try {
            setLoading(true);
            const { data } = await api.delete(`/courses/${courseId}`);
            toast.success(data.message || 'Course deleted');
            fetchCourses(page);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete course');
            setLoading(false);
        }
    };

    return (
        <div className="instructor-page-container">
            <div className="instructor-page-header">
                <div>
                    <h1 className="instructor-page-title">My Courses</h1>
                    <p className="instructor-page-subtitle">Manage all the courses you have created.</p>
                </div>
                <Link to="/instructor/courses/new" className="btn btn-primary">
                    <Plus size={18} /> Create New Course
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="search-bar-container" style={{ margin: 0 }}>
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search your courses..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    />
                </div>
            </div>

            {/* Courses List */}
            {loading && courses.length === 0 ? (
                <div className="flex-center" style={{ padding: '4rem' }}>
                    <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                </div>
            ) : courses.length === 0 ? (
                <div className="empty-state card" style={{ padding: '5rem 2rem' }}>
                    <div className="empty-state-icon">
                        <BookOpen size={48} />
                    </div>
                    <h3 className="empty-state-title">No courses found</h3>
                    <p className="empty-state-text">You haven't created any courses yet, or none match your search.</p>
                    <button onClick={() => navigate('/instructor/courses/new')} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                        Create Your First Course
                    </button>
                </div>
            ) : (
                <div className="instructor-course-grid">
                    {courses.map(course => (
                        <div key={course._id} className="instructor-course-card animate-in">
                            <div className="course-card-image">
                                <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=No+Thumbnail'; }}
                                />
                                <div className="course-card-status">
                                    <span className={`status-badge ${course.status || 'draft'}`}>
                                        {course.status ? course.status.toUpperCase() : 'DRAFT'}
                                    </span>
                                </div>
                            </div>
                            <div className="course-card-body">
                                <div className="course-card-header">
                                    <h3 className="course-card-title" title={course.title}>
                                        {course.title}
                                    </h3>
                                    <span className="course-card-price">₹{course.price}</span>
                                </div>

                                <div className="course-card-meta">
                                    <div className="meta-item">
                                        <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                                        <span>{course.rating.toFixed(1)} ({course.numReviews})</span>
                                    </div>
                                    <div className="meta-item">
                                        <Users size={14} />
                                        <span>{course.studentCount || 0} Students</span>
                                    </div>
                                </div>

                                <div className="course-card-actions">
                                    <div className="action-row">
                                        <button onClick={() => navigate(`/instructor/course/${course._id}/overview`)} className="btn btn-outline btn-sm action-btn" title="Instructor Overview">
                                            <Eye size={14} /> View
                                        </button>
                                        <button onClick={() => navigate(`/instructor/courses/${course._id}/edit`)} className="btn btn-outline btn-sm action-btn" title="Edit Course">
                                            <Edit size={14} /> Edit
                                        </button>
                                    </div>
                                    <div className="action-row">
                                        <button onClick={() => navigate(`/instructor/course/${course._id}/assignments`)} className="btn btn-primary btn-sm action-btn" title="Manage Assignments">
                                            <ClipboardList size={14} /> Assignment
                                        </button>
                                        <button onClick={() => navigate(`/instructor/course/${course._id}/quizzes`)} className="btn btn-primary btn-sm action-btn" title="Manage Quizzes">
                                            <HelpCircle size={14} /> Quiz
                                        </button>
                                    </div>
                                    <button onClick={() => handleDelete(course._id)} className="btn btn-icon-danger-sm delete-btn-corner" title="Delete Course">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
                <div className="pagination-container">
                    <div className="pagination-controls">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="btn btn-outline btn-sm"
                        >Previous</button>
                        <span className="pagination-info">Page {page} of {pages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(pages, p + 1))}
                            disabled={page === pages}
                            className="btn btn-outline btn-sm"
                        >Next</button>
                    </div>
                </div>
            )}
        </div>
    );

};

export default InstructorCourses;
