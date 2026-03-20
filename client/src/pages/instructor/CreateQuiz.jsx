import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Save, ArrowLeft, Plus, Trash2, Layout, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateQuiz = () => {
    const { api } = useAuth();
    const navigate = useNavigate();
    const { courseId, id } = useParams();
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [fetchingCourses, setFetchingCourses] = useState(true);

    const [formData, setFormData] = useState({
        title: '',
        courseId: courseId || '',
        questions: [
            { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0 }
        ]
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                if (id) {
                    // Edit Mode
                    const { data } = await api.get(`/instructor/quizzes/${id}`);
                    if (data.success) {
                        const quiz = data.data;
                        setFormData({
                            title: quiz.title,
                            courseId: quiz.course?._id || quiz.course,
                            questions: quiz.questions || []
                        });
                        setSelectedCourse(quiz.course);
                    }
                } else if (courseId) {
                    // Create Mode (Specific Course)
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

    const addQuestion = () => {
        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0 }]
        }));
    };

    const removeQuestion = (index) => {
        if (formData.questions.length === 1) return toast.error('At least one question is required');
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const updateQuestion = (index, field, value) => {
        const updatedQuestions = [...formData.questions];
        updatedQuestions[index][field] = value;
        setFormData(prev => ({ ...prev, questions: updatedQuestions }));
    };

    const updateOption = (qIndex, oIndex, value) => {
        const updatedQuestions = [...formData.questions];
        updatedQuestions[qIndex].options[oIndex] = value;
        setFormData(prev => ({ ...prev, questions: updatedQuestions }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.courseId) {
            return toast.error('Please fill in all required fields');
        }

        // Validate questions
        for (const q of formData.questions) {
            if (!q.questionText) return toast.error('All questions must have text');
            if (q.options.some(opt => !opt)) return toast.error('All options must be filled');
        }

        try {
            setLoading(true);
            const payload = {
                title: formData.title,
                courseId: formData.courseId,
                questions: formData.questions
            };

            const { data } = id
                ? await api.put(`/instructor/quizzes/${id}`, payload)
                : await api.post('/instructor/quizzes', payload);

            if (data) {
                toast.success(id ? 'Quiz updated successfully' : 'Quiz created successfully');
                if (courseId) {
                    navigate(`/instructor/course/${courseId}/quizzes`);
                } else {
                    navigate('/instructor/quizzes');
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${id ? 'update' : 'create'} quiz`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="instructor-page-container-compact">
            <div className="instructor-page-header">
                <div>
                    <h1 className="instructor-page-title">{id ? 'Edit Quiz' : 'Create New Quiz'}</h1>
                    <p className="instructor-page-subtitle">{id ? 'Update your quiz questions and settings' : 'Design an engaging quiz for your students'}</p>
                </div>
                <button
                    onClick={() => {
                        if (courseId) {
                            navigate(`/instructor/course/${courseId}/quizzes`);
                        } else {
                            navigate('/instructor/quizzes');
                        }
                    }}
                    className="back-btn-modern"
                >
                    Back
                </button>
            </div>

            <form onSubmit={handleSubmit} className="form-section">
                <div className="modern-form-card shadow-soft">
                    <div className="form-group-modern">
                        <label className="label-modern">Select Course <span className="required">*</span></label>
                        <div className="input-with-icon">
                            <Layout className="input-icon-left" size={18} />
                            <select
                                name="courseId"
                                value={formData.courseId}
                                onChange={(e) => setFormData(prev => ({ ...prev, courseId: e.target.value }))}
                                disabled={fetchingCourses || !!courseId || !!id}
                                className="modern-select-field"
                                style={{ cursor: (!!courseId || !!id) ? 'not-allowed' : 'pointer' }}
                            >
                                {fetchingCourses ? (
                                    <option>Loading courses...</option>
                                ) : (courseId || id) ? (
                                    <option value={formData.courseId}>{selectedCourse?.title || 'Selected Course'}</option>
                                ) : courses.length === 0 ? (
                                    <option>No courses available</option>
                                ) : (
                                    <>
                                        <option value="" disabled>Select a course</option>
                                        {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                    </>
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="form-group-modern">
                        <label className="label-modern">Quiz Title <span className="required">*</span></label>
                        <div className="input-with-icon">
                            <HelpCircle className="input-icon-left" size={18} />
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g., Midterm Assessment, Chapter 1 Quiz"
                                className="modern-input-field"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <div className="quiz-header-actions">
                        <h2 className="section-title-modern">Questions</h2>
                        <button
                            type="button"
                            onClick={addQuestion}
                            className="btn-add-question-quiz"
                        >
                            <Plus size={18} /> Add Question
                        </button>
                    </div>

                    {formData.questions.map((q, qIndex) => (
                        <div key={qIndex} className="quiz-question-card animate-fade-in">
                            <div className="question-card-header">
                                <span className="question-number-badge">Question {qIndex + 1}</span>
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(qIndex)}
                                    className="btn-delete-question"
                                    title="Remove Question"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            <div className="form-group-modern" style={{ marginBottom: '1.5rem' }}>
                                <label className="label-modern">Question Text</label>
                                <input
                                    type="text"
                                    value={q.questionText}
                                    onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                                    placeholder="Enter your question here..."
                                    className="modern-input-field"
                                    required
                                />
                            </div>

                            <div className="options-grid">
                                {q.options.map((opt, oIndex) => (
                                    <div key={oIndex} className="option-field-wrapper">
                                        <div className="option-label-horizontal">
                                            <span>Option {oIndex + 1}</span>
                                            <label className={`correct-badge-selection ${q.correctAnswerIndex === oIndex ? 'active' : ''}`}>
                                                <input
                                                    type="radio"
                                                    name={`correct-${qIndex}`}
                                                    checked={q.correctAnswerIndex === oIndex}
                                                    onChange={() => updateQuestion(qIndex, 'correctAnswerIndex', oIndex)}
                                                />
                                                {q.correctAnswerIndex === oIndex ? 'Correct' : 'Mark Correct'}
                                            </label>
                                        </div>
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                            placeholder={`Type option ${oIndex + 1}...`}
                                            className="modern-input-field"
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
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
                        className="btn-primary-modern"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>{id ? 'Updating...' : 'Creating...'}</span>
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                <span>{id ? 'Update Quiz' : 'Create Quiz'}</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateQuiz;
