import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, Loader2, HelpCircle, CheckCircle, TrendingUp, User, Calendar, ChevronRight, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const InstructorQuizzes = () => {
    const { api } = useAuth();
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [loading, setLoading] = useState(true);
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    useEffect(() => {
        fetchQuizzes();
    }, [courseId]);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const endpoint = courseId ? `/instructor/quizzes?courseId=${courseId}` : '/instructor/quizzes';
            const { data } = await api.get(endpoint);
            if (data.success) setQuizzes(data.data);
        } catch (error) {
            toast.error('Failed to load quizzes');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteQuiz = async (id) => {
        if (!window.confirm('Are you sure you want to delete this quiz? All student attempts will also be removed.')) return;
        try {
            const { data } = await api.delete(`/instructor/quizzes/${id}`);
            if (data.success) {
                toast.success('Quiz deleted');
                if (selectedQuiz?._id === id) setSelectedQuiz(null);
                fetchQuizzes();
            }
        } catch (error) {
            toast.error('Failed to delete quiz');
        }
    };

    return (
        <div className="instructor-page-container">
            <div className="instructor-page-header">
                <div>
                    <h1 className="instructor-page-title">Quiz Management</h1>
                    <p className="instructor-page-subtitle">Manage quizzes and monitor student results for this course.</p>
                </div>
                <Link to={courseId ? `/instructor/course/${courseId}/quiz/create` : "/instructor/quizzes/new"} className="btn btn-primary">
                    <Plus size={18} /> New Quiz
                </Link>
            </div>

            <div className={`split-view-container ${selectedQuiz ? 'active-detail' : ''}`}>
                {/* Quizzes List */}
                <div className="list-column card">
                    <h3 className="card-header-title" style={{ marginBottom: '1.5rem' }}>
                        Your Quizzes ({quizzes.length})
                    </h3>

                    {loading ? (
                        <div className="flex-center" style={{ padding: '3rem' }}>
                            <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                        </div>
                    ) : quizzes.length === 0 ? (
                        <div className="empty-state">
                            <p>No quizzes found.</p>
                        </div>
                    ) : (
                        <div className="item-list-wrapper">
                            {quizzes.map(q => (
                                <div
                                    key={q._id}
                                    className={`selectable-item ${selectedQuiz?._id === q._id ? 'active' : ''}`}
                                    onClick={() => setSelectedQuiz(q)}
                                >
                                    <div className="item-header">
                                        <h4 className="item-title">{q.title}</h4>
                                        <span className="item-subtitle">{q.course?.title}</span>
                                    </div>
                                    <div className="item-meta">
                                        <div className="item-stats">
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <HelpCircle size={14} /> {q.questions?.length} Qs
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <TrendingUp size={14} /> {q.attempts?.length} Attempts
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <button
                                                className="btn-icon"
                                                style={{ color: 'var(--primary)', padding: '4px' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/instructor/quizzes/${q._id}/edit`);
                                                }}
                                                title="Edit Quiz"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                style={{ color: 'var(--error)', padding: '4px' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteQuiz(q._id);
                                                }}
                                                title="Delete Quiz"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <ChevronRight size={18} className="text-muted" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Attempts Detail View */}
                {selectedQuiz && (
                    <div className="detail-column card animate-in">
                        <div className="detail-view-header">
                            <h3 className="card-header-title">Results: {selectedQuiz.title}</h3>
                            <button className="detail-close-btn" onClick={() => setSelectedQuiz(null)}>
                                Close
                            </button>
                        </div>

                        <div className="results-container">
                            {selectedQuiz.attempts?.length === 0 ? (
                                <div className="empty-state" style={{ padding: '4rem 0' }}>
                                    <TrendingUp size={48} className="text-muted" style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                    <p>No student attempts yet.</p>
                                </div>
                            ) : (
                                <div className="table-container">
                                    <table className="admin-table responsive-table-stack">
                                        <thead>
                                            <tr>
                                                <th>Student</th>
                                                <th>Score</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedQuiz.attempts.map((attempt, idx) => (
                                                <tr key={idx}>
                                                    <td data-label="Student">
                                                        <div className="student-info">
                                                            <div className="student-avatar" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>
                                                                {attempt.student?.name?.charAt(0)}
                                                            </div>
                                                            <span className="student-name">{attempt.student?.name}</span>
                                                        </div>
                                                    </td>
                                                    <td data-label="Score">
                                                        <span className={`grade-badge ${attempt.score >= 70 ? 'success' : attempt.score >= 40 ? 'warning' : 'error'}`}>
                                                            {attempt.score}%
                                                        </span>
                                                    </td>
                                                    <td data-label="Date">
                                                        {new Date(attempt.attemptDate).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Quiz Content Preview */}
                        <div className="quiz-preview-section">
                            <h4 className="preview-title-sm">Quiz Content Preview</h4>
                            <div className="question-list">
                                {selectedQuiz.questions?.map((q, idx) => (
                                    <div key={idx} className="question-preview-item">
                                        <p style={{ fontWeight: '700', marginBottom: '1rem', fontSize: '0.95rem' }}>
                                            Q{idx + 1}: {q.questionText}
                                        </p>
                                        <div className="option-preview-grid">
                                            {q.options?.map((opt, oIdx) => (
                                                <div key={oIdx} className={`option-preview-item ${oIdx === q.correctAnswerIndex ? 'correct' : ''}`}>
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


export default InstructorQuizzes;
