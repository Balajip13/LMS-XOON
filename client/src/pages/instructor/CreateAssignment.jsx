import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Save, ArrowLeft, Calendar, FileText, Layout } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateAssignment = () => {
    const { api } = useAuth();
    const navigate = useNavigate();
    const { courseId, id } = useParams();
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [fetchingCourses, setFetchingCourses] = useState(true);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        courseId: courseId || '',
        dueDate: ''
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                if (id) {
                    // Edit Mode
                    const { data } = await api.get(`/instructor/assignments/${id}`);
                    if (data.success) {
                        const ass = data.data;
                        setFormData({
                            title: ass.title,
                            description: ass.description,
                            courseId: ass.course?._id || ass.course,
                            dueDate: ass.dueDate ? new Date(ass.dueDate).toISOString().split('T')[0] : ''
                        });
                        setSelectedCourse(ass.course);
                    }
                } else if (courseId) {
                    // Create Mode with specific course
                    const { data } = await api.get(`/courses/${courseId}`);
                    setSelectedCourse(data);
                    setFormData(prev => ({ ...prev, courseId }));
                } else {
                    // Create Mode (Generic)
                    const { data } = await api.get('/instructor/courses');
                    const courseList = data.courses || data;
                    setCourses(courseList);
                    if (courseList.length > 0) {
                        setFormData(prev => ({ ...prev, courseId: courseList[0]._id }));
                    }
                }
            } catch (error) {
                toast.error('Failed to load course details');
            } finally {
                setFetchingCourses(false);
            }
        };
        fetchInitialData();
    }, [api, courseId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.description || !formData.courseId) {
            return toast.error('Please fill in all required fields');
        }

        try {
            setLoading(true);
            const payload = {
                title: formData.title,
                description: formData.description,
                courseId: formData.courseId,
                dueDate: formData.dueDate
            };

            const { data } = id
                ? await api.put(`/instructor/assignments/${id}`, payload)
                : await api.post('/instructor/assignments', payload);

            if (data) {
                toast.success(id ? 'Assignment updated successfully' : 'Assignment created successfully');
                if (courseId) {
                    navigate(`/instructor/course/${courseId}/assignments`);
                } else {
                    navigate('/instructor/assignments');
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${id ? 'update' : 'create'} assignment`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="instructor-page-container-compact">
            <div className="instructor-page-header">
                <div className="header-left">
                    <h1 className="instructor-page-title">{id ? 'Edit Assignment' : 'Create Assignment'}</h1>
                    <p className="instructor-page-subtitle">{id ? 'Update assignment details for your students' : 'Set up a new task for your students to complete'}</p>
                </div>
                <button
                    onClick={() => {
                        if (courseId) {
                            navigate(`/instructor/course/${courseId}/assignments`);
                        } else {
                            navigate('/instructor/assignments');
                        }
                    }}
                    className="back-btn-modern"
                >
                    Back
                </button>
            </div>

            <form onSubmit={handleSubmit} className="modern-form-card shadow-soft animate-fade-in">
                <div className="form-section">
                    <div className="form-group-modern">
                        <label className="label-modern">Select Course <span className="required">*</span></label>
                        <div className="input-with-icon">
                            <Layout className="input-icon-left" size={18} />
                            <select
                                name="courseId"
                                value={formData.courseId}
                                onChange={handleChange}
                                disabled={fetchingCourses || !!courseId || !!id}
                                className="modern-select-field"
                                style={{ cursor: (!!courseId || !!id) ? 'not-allowed' : 'pointer' }}
                            >
                                {fetchingCourses ? (
                                    <option>Loading courses...</option>
                                ) : (courseId || id) ? (
                                    <option value={formData.courseId}>{selectedCourse?.title || 'Selected Course'}</option>
                                ) : courses.length === 0 ? (
                                    <option>No courses found</option>
                                ) : (
                                    courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="form-group-modern">
                        <label className="label-modern">Assignment Title <span className="required">*</span></label>
                        <div className="input-with-icon">
                            <FileText className="input-icon-left" size={18} />
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Final Case Study, Week 1 Project"
                                className="modern-input-field"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group-modern">
                        <label className="label-modern">Instructions & Description <span className="required">*</span></label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Provide clear, detailed instructions for your students..."
                            className="modern-textarea-field"
                            required
                        />
                    </div>

                    <div className="form-group-modern">
                        <label className="label-modern">Due Date</label>
                        <div className="input-with-icon">
                            <Calendar className="input-icon-left" size={18} />
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                className="modern-input-field"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-actions-modern">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="btn-ghost-modern"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || fetchingCourses}
                        className="btn-primary-modern shadow-sm"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                <span>{id ? 'Updating...' : 'Creating...'}</span>
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>{id ? 'Update Assignment' : 'Create Assignment'}</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateAssignment;
