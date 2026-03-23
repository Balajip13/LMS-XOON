import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, Loader2, FileText, CheckCircle, Clock, ExternalLink, ChevronRight, GraduationCap, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const InstructorAssignments = () => {
    const { api } = useAuth();
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [gradingData, setGradingData] = useState({ grade: '', feedback: '' });
    const [gradingLoading, setGradingLoading] = useState(false);

    useEffect(() => {
        fetchAssignments();
    }, [courseId]);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const endpoint = courseId ? `/instructor/assignments?courseId=${courseId}` : '/instructor/assignments';
            const { data } = await api.get(endpoint);
            if (data.success) setAssignments(data.data);
        } catch (error) {
            toast.error('Failed to load assignments');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAssignment = async (id) => {
        if (!window.confirm('Are you sure you want to delete this assignment? All student submissions will also be removed.')) return;
        try {
            const { data } = await api.delete(`/instructor/assignments/${id}`);
            if (data.success) {
                toast.success('Assignment deleted');
                if (selectedAssignment?._id === id) setSelectedAssignment(null);
                fetchAssignments();
            }
        } catch (error) {
            toast.error('Failed to delete assignment');
        }
    };

    const handleGrade = async (subId) => {
        if (!gradingData.grade) return toast.error('Please enter a grade');
        try {
            setGradingLoading(true);
            const { data } = await api.put(`/instructor/assignments/${selectedAssignment._id}/grade/${subId}`, gradingData);
            if (data.success) {
                toast.success('Graded successfully');
                fetchAssignments();
                // Update selected assignment to show new grade
                const updated = assignments.find(a => a._id === selectedAssignment._id);
                // Actually easier to just refresh everything
                setSelectedAssignment(null);
            }
        } catch (error) {
            toast.error('Failed to submit grade');
        } finally {
            setGradingLoading(false);
        }
    };

    return (
        <div className="instructor-page-container">
            <div className="instructor-page-header">
                <div>
                    <h1 className="instructor-page-title">Assignments</h1>
                    <p className="instructor-page-subtitle">Track submissions and grade student work for this course.</p>
                </div>
                <Link to={courseId ? `/instructor/course/${courseId}/assignment/create` : "/instructor/assignments/new"} className="btn btn-primary">
                    <Plus size={18} /> Create Assignment
                </Link>
            </div>

            <div className={`split-view-container ${selectedAssignment ? 'active-detail' : ''}`}>
                {/* Assignments List */}
                <div className="list-column card">
                    <h3 className="card-header-title" style={{ marginBottom: '1.5rem' }}>
                        Your Assignments ({assignments.length})
                    </h3>

                    {loading ? (
                        <div className="flex-center" style={{ padding: '3rem' }}>
                            <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                        </div>
                    ) : assignments.length === 0 ? (
                        <div className="empty-state">
                            <p>No assignments created yet.</p>
                        </div>
                    ) : (
                        <div className="item-list-wrapper">
                            {assignments.map(a => (
                                <div
                                    key={a._id}
                                    className={`selectable-item ${selectedAssignment?._id === a._id ? 'active' : ''}`}
                                    onClick={() => setSelectedAssignment(a)}
                                >
                                    <div className="item-header">
                                        <h4 className="item-title">{a.title}</h4>
                                        <span className="item-subtitle">{a.course?.title}</span>
                                    </div>
                                    <div className="item-meta">
                                        <div className="item-stats">
                                            <span className="stat-pill stat-pending-pill">
                                                {a.submissions?.filter(s => s.status === 'pending').length} Pending
                                            </span>
                                            <span className="stat-pill stat-graded-pill">
                                                {a.submissions?.filter(s => s.status === 'graded').length} Graded
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <button
                                                className="btn-icon"
                                                style={{ color: 'var(--primary)', padding: '4px' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/instructor/assignments/${a._id}/edit`);
                                                }}
                                                title="Edit Assignment"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                style={{ color: 'var(--error)', padding: '4px' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteAssignment(a._id);
                                                }}
                                                title="Delete Assignment"
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

                {/* Submissions Detail View */}
                {selectedAssignment && (
                    <div className="detail-column card animate-in">
                        <div className="detail-view-header">
                            <h3 className="card-header-title">Submissions: {selectedAssignment.title}</h3>
                            <button className="detail-close-btn" onClick={() => setSelectedAssignment(null)}>
                                Close
                            </button>
                        </div>

                        <div className="sub-list">
                            {selectedAssignment.submissions?.length === 0 ? (
                                <div className="empty-state" style={{ padding: '4rem 0' }}>
                                    <p>No submissions yet.</p>
                                </div>
                            ) : selectedAssignment.submissions?.map(sub => (
                                <div key={sub._id} className="sub-card">
                                    <div className="sub-card-header">
                                        <div className="student-info">
                                            <div className="student-avatar">
                                                {sub.student?.profilePic ? (
                                                    <img
                                                        src={sub.student.profilePic}
                                                        alt={sub.student?.name}
                                                        onError={(e) => { e.target.src = '/default-avatar.png'; }}
                                                    />
                                                ) : (
                                                    sub.student?.name?.charAt(0).toUpperCase() || 'S'
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="student-name">{sub.student?.name}</h4>
                                                <p className="sub-date">
                                                    Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`grade-badge ${sub.status === 'graded' ? 'success' : 'warning'}`}>
                                            {sub.status.toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="sub-file-box">
                                        <FileText size={18} color="var(--primary)" />
                                        <span className="sub-file-name">{sub.fileUrl?.split('/').pop() || 'Assignment File'}</span>
                                        <a href={sub.fileUrl} target="_blank" rel="noreferrer" className="btn-icon">
                                            <ExternalLink size={16} />
                                        </a>
                                    </div>

                                    {sub.status === 'graded' ? (
                                        <div className="alert-success-light" style={{ padding: '1rem', borderRadius: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: '700' }}>Grade: {sub.grade}/100</span>
                                                <GraduationCap size={18} />
                                            </div>
                                            <p style={{ fontSize: '0.9rem', opacity: 0.8, margin: 0 }}>{sub.feedback}</p>
                                        </div>
                                    ) : (
                                        <div className="grading-form">
                                            <div className="grading-inputs">
                                                <input
                                                    type="number"
                                                    placeholder="Grade"
                                                    className="form-control"
                                                    max="100"
                                                    onChange={(e) => setGradingData(prev => ({ ...prev, grade: e.target.value }))}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Feedback for student..."
                                                    className="form-control"
                                                    onChange={(e) => setGradingData(prev => ({ ...prev, feedback: e.target.value }))}
                                                />
                                            </div>
                                            <button
                                                disabled={gradingLoading}
                                                onClick={() => handleGrade(sub.student?._id || sub.student)}
                                                className="btn btn-primary"
                                                style={{ width: '100%' }}
                                            >
                                                {gradingLoading ? <Loader2 className="animate-spin" size={18} /> : 'Submit Grade'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstructorAssignments;
