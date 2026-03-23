import { useState, useEffect } from 'react';
import {
    CheckCircle,
    XCircle,
    Trash2,
    Search,
    Users,
    ClipboardList,
    RefreshCw,
    Loader2,
    Download,
    FileText,
    AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import './AdminInstructors.css';

const API_ORIGIN = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

const AdminInstructors = () => {
    const { api } = useAuth();

    const handleView = (resumeRef) => {
        if (!resumeRef) {
            toast.error('Resume not available');
            return;
        }
        if (/^https?:\/\//i.test(resumeRef)) {
            window.open(resumeRef, '_blank');
            return;
        }
        window.open(`${API_ORIGIN}/uploads/resumes/${encodeURIComponent(resumeRef)}`, '_blank');
    };

    const handleDownload = async (resumeRef, displayName) => {
        if (!resumeRef) {
            toast.error('Resume not available');
            return;
        }

        if (/^https?:\/\//i.test(resumeRef)) {
            try {
                const response = await fetch(resumeRef);
                if (!response.ok) throw new Error(`Download failed: ${response.status}`);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = displayName || 'resume';
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } catch (err) {
                console.error('Download error:', err);
                window.open(resumeRef, '_blank');
            }
            return;
        }

        try {
            const token = localStorage.getItem('token');

            if (!token) {
                toast.error('Authentication required');
                return;
            }

            const encoded = encodeURIComponent(resumeRef);

            const response = await fetch(
                `${API_ORIGIN}/api/instructor/resume/download/${encoded}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Download failed: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = displayName || resumeRef;
            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download error:', err);
            toast.error(err.message || 'Failed to download resume');
        }
    };
    const [activeTab, setActiveTab] = useState('approved');
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [isActioning, setIsActioning] = useState(false);
    const [rejectionModal, setRejectionModal] = useState({ show: false, appId: null, reason: '' });
    const [deleteModal, setDeleteModal] = useState({ show: false, instructorId: null, name: '' });

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchApplications();
            toast.success("Data synchronized successfully");
        } catch (err) {
            toast.error("Failed to sync data");
        } finally {
            setRefreshing(false);
        }
    };

    const handleExport = async (format) => {
        try {
            toast.loading(`Preparing ${format.toUpperCase()} export...`, { id: 'export-toast' });
            const response = await api.get(`/admin/instructors/export?format=${format}&tab=${activeTab}`, {
                responseType: 'blob'
            });

            const fileName = `instructors_${activeTab}_${new Date().getTime()}.${format}`;
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            toast.success(`${format.toUpperCase()} Exported successfully`, { id: 'export-toast' });
        } catch (err) {
            console.error('Export failed:', err);
            toast.error('Failed to export data', { id: 'export-toast' });
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/instructor-applications');
            if (data?.success) {
                setApplications(data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch applications:', err);
            toast.error('Failed to load instructor data');
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewApplication = async (appId, status, manualReason) => {
        if (!appId) {
            toast.error("Application ID is missing");
            return;
        }

        if (status === 'rejected' && !manualReason) {
            setRejectionModal({ show: true, appId, reason: '' });
            return;
        }

        setIsActioning(true);
        try {
            const { data } = await api.put(`/instructor/applications/${appId}/review`, {
                status,
                rejectionReason: manualReason || ''
            });
            if (data.success) {
                toast.success(data.message);
                // Instant UI Update
                setApplications(prev => prev.map(app =>
                    app._id === appId
                        ? { ...app, status, rejectionReason: manualReason || app.rejectionReason }
                        : app
                ));
                if (status === 'rejected') setRejectionModal({ show: false, appId: null, reason: '' });
            }
        } catch (err) {
            console.error('[ReviewError]', err);
            toast.error(err.response?.data?.message || `Failed to ${status} application`);
        } finally {
            setIsActioning(false);
        }
    };

    const handleRemoveInstructor = async () => {
        const { instructorId } = deleteModal;
        if (!instructorId) {
            toast.error("User ID is missing");
            return;
        }

        setIsActioning(true);
        try {
            const { data } = await api.delete(`/instructor/${instructorId}`);
            if (data.success) {
                toast.success(data.message);
                setApplications(prev => prev.filter(app => (app.userId?._id || app.userId) !== instructorId));
                setDeleteModal({ show: false, instructorId: null, name: '' });
            }
        } catch (err) {
            console.error('[RemoveError]', err);
            toast.error(err.response?.data?.message || 'Failed to remove instructor');
        } finally {
            setIsActioning(false);
        }
    };

    const approvedInstructors = applications.filter(app =>
        app.status === 'approved' &&
        app.userId?._id &&
        ((app.fullName || app.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (app.userId?.email || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const pendingApplications = applications.filter(app =>
        app.status === 'pending' &&
        app._id &&
        ((app.fullName || app.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (app.userId?.email || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading && applications.length === 0) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="admin-page-container">
            <header className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Instructor Management</h1>
                    <p className="admin-page-subtitle">Verify educators and manage teaching status from one place</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-outline btn-compact"
                        onClick={handleRefresh}
                        disabled={refreshing || loading}
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        <span className="btn-text">{refreshing ? 'Syncing...' : 'Sync Data'}</span>
                    </button>
                    <div className="export-group">
                        <button className="btn btn-outline btn-compact" onClick={() => handleExport('csv')} disabled={loading || applications.length === 0}>
                            <Download size={14} /> CSV
                        </button>
                        <button className="btn btn-outline btn-compact" onClick={() => handleExport('pdf')} disabled={loading || applications.length === 0}>
                            <FileText size={14} /> PDF
                        </button>
                    </div>
                </div>
            </header>

            <div className="admin-controls-panel" style={{ marginBottom: '1.5rem' }}>
                <div className="search-bar-container" style={{ maxWidth: '400px' }}>
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search instructors or applicants..."
                        className="form-control"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '2.75rem' }}
                    />
                </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="admin-tabs">
                <button
                    className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
                    onClick={() => setActiveTab('approved')}
                >
                    <Users size={18} />
                    Approved Instructors
                    <span className="badge-count-inline">{approvedInstructors.length}</span>
                </button>
                <button
                    className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    <ClipboardList size={18} />
                    Pending Applications
                    {pendingApplications.length > 0 && (
                        <span className="badge-count-inline pulse">
                            {pendingApplications.length}
                        </span>
                    )}
                </button>
            </div>

            <div className="tab-content-area">
                {activeTab === 'approved' ? (
                    <div className="admin-section-card">
                        {approvedInstructors.length === 0 ? (
                            <div className="empty-state-small">
                                <Users size={48} opacity={0.1} />
                                <p>No verified instructors found</p>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Instructor</th>
                                            <th>Email</th>
                                            <th>Expertise</th>
                                            <th>Experience</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {approvedInstructors.map(app => (
                                            <tr key={app._id}>
                                                <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700', overflow: 'hidden' }}>
                                                        {app.userId?.profilePic ? (
                                                            <img
                                                                src={app.userId.profilePic}
                                                                alt={app.fullName || app.userId?.name}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                onError={(e) => {
                                                                    e.target.src = '/default-avatar.png';
                                                                }}
                                                            />
                                                        ) : (
                                                            <img src="/default-avatar.png" alt="Default Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        )}
                                                    </div>
                                                    <div className="font-bold">{app.fullName || app.userId?.name}</div>
                                                </td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{app.userId?.email}</td>
                                                <td>
                                                    <div className="expertise-badge-sm">{app.expertise}</div>
                                                </td>
                                                <td>{app.experience}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button
                                                        className="admin-icon-btn danger"
                                                        onClick={() => setDeleteModal({ show: true, instructorId: app.userId?._id, name: app.fullName || app.userId?.name })}
                                                        title="Remove Instructor"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="pending-applications-view">
                        {pendingApplications.length === 0 ? (
                            <div className="admin-section-card">
                                <div className="empty-state-small">
                                    <ClipboardList size={48} opacity={0.1} />
                                    <p>No pending applications for review</p>
                                </div>
                            </div>
                        ) : (
                            <div className="pending-grid-modern">
                                {pendingApplications.map(app => (
                                    <div key={app._id} className="modern-app-card">
                                        <div className="card-header-modern">
                                            <div className="user-avatar-modern" style={{
                                                overflow: 'hidden', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '14px',
                                                background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                                                color: '#fff',
                                                fontWeight: '700',
                                                fontSize: '18px',
                                                boxShadow: '0 4px 12px rgba(79,70,229,0.25)'
                                            }}>
                                                {app.userId?.profilePic ? (
                                                    <img
                                                        src={app.userId.profilePic}
                                                        alt={app.fullName || app.userId?.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        onError={(e) => {
                                                            e.target.src = '/default-avatar.png';
                                                        }}
                                                    />
                                                ) : (
                                                    <img src="/default-avatar.png" alt="Default Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                )}
                                            </div>
                                            <div className="user-info-modern">
                                                <h4>{app.fullName || app.userId?.name}</h4>
                                                <span>{app.userId?.email}</span>
                                            </div>
                                            <div className="status-badge-modern pending">Pending Review</div>
                                        </div>

                                        <div className="card-details-grid">
                                            <div className="detail-row">
                                                <div className="detail-item">
                                                    <label>Expertise</label>
                                                    <p>{app.expertise}</p>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Experience</label>
                                                    <p>{app.experience}</p>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Category</label>
                                                    <p>{app.category}</p>
                                                </div>
                                            </div>

                                            <div className="detail-block" style={{ marginTop: '18px', marginBottom: '12px' }}>
                                                <p style={{
                                                    fontSize: '12px',
                                                    color: 'var(--text-muted)',
                                                    fontWeight: '600',
                                                    marginBottom: '6px',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    PROFESSIONAL BIOGRAPHY
                                                </p>
                                                <p style={{
                                                    fontSize: '14px',
                                                    color: 'var(--text)',
                                                    lineHeight: '1.6',
                                                    margin: 0
                                                }}>
                                                    {app.biography}
                                                </p>
                                            </div>

                                            <div className="detail-block" style={{ marginTop: '18px', marginBottom: '12px' }}>
                                                <p style={{
                                                    fontSize: '12px',
                                                    color: 'var(--text-muted)',
                                                    fontWeight: '600',
                                                    marginBottom: '6px',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    TEACHING MOTIVATION
                                                </p>
                                                <p style={{
                                                    fontSize: '14px',
                                                    color: 'var(--text)',
                                                    lineHeight: '1.6',
                                                    margin: 0
                                                }}>
                                                    {app.reason}
                                                </p>
                                            </div>

                                            {app.portfolio && (
                                                <div className="detail-block">
                                                    <label>Portfolio / Links</label>
                                                    <a href={app.portfolio} target="_blank" rel="noopener noreferrer" className="portfolio-link">
                                                        View Professional Profile
                                                    </a>
                                                </div>
                                            )}

                                            {app.resume && (
                                                <div className="detail-block" style={{ marginTop: '18px', marginBottom: '12px' }}>
                                                    <p style={{
                                                        fontSize: '12px',
                                                        color: 'var(--text-muted)',
                                                        fontWeight: '600',
                                                        marginBottom: '6px'
                                                    }}>
                                                        RESUME
                                                    </p>
                                                    <div className="resume-info">
                                                        <FileText size={16} color="var(--primary)" />
                                                        <span style={{
                                                            fontSize: '13px',
                                                            color: 'var(--text)',
                                                            wordBreak: 'break-all'
                                                        }}>
                                                            📄 {app.resumeOriginalName || app.resume}
                                                        </span>
                                                    </div>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            marginTop: '12px'
                                                        }}
                                                    >
                                                        <button
                                                            onClick={() => handleDownload(app.resume, app.resumeOriginalName)}
                                                            style={{
                                                                padding: '10px 20px',
                                                                fontSize: '14px',
                                                                fontWeight: '600',
                                                                borderRadius: '10px',
                                                                border: 'none',
                                                                backgroundColor: 'var(--primary)',
                                                                color: '#fff',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '8px',
                                                                minWidth: '180px',
                                                                margin: '10px auto',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                            onMouseOver={(e) => {
                                                                e.target.style.backgroundColor = '#4338ca';
                                                            }}
                                                            onMouseOut={(e) => {
                                                                e.target.style.backgroundColor = 'var(--primary)';
                                                            }}
                                                            disabled={!app.resume}
                                                        >
                                                            <Download size={16} />
                                                            Download Resume
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="card-footer-modern">
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    gap: '14px',
                                                    marginTop: '20px',
                                                    width: '100%'
                                                }}
                                            >
                                                <button
                                                    className="btn btn-primary btn-full-mobile"
                                                    onClick={() => handleReviewApplication(app._id, 'approved')}
                                                    disabled={isActioning}
                                                >
                                                    {isActioning ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                                    Approve Application
                                                </button>
                                                <button
                                                    className="btn btn-outline btn-full-mobile destructive"
                                                    onClick={() => handleReviewApplication(app._id, 'rejected')}
                                                    disabled={isActioning}
                                                >
                                                    <XCircle size={16} />
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Rejection Modal */}
            {rejectionModal.show && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="modal-header">
                            <h3>Reject Application</h3>
                            <button className="close-btn" onClick={() => setRejectionModal({ show: false, appId: null, reason: '' })}><XCircle size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <p>Please explain why this application is being rejected. The user will see this feedback.</p>
                            <textarea
                                className="form-control"
                                rows="5"
                                placeholder="State the reason for rejection clearly..."
                                value={rejectionModal.reason}
                                onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
                            ></textarea>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-outline"
                                onClick={() => setRejectionModal({ show: false, appId: null, reason: '' })}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary destructive"
                                onClick={() => handleReviewApplication(rejectionModal.appId, 'rejected', rejectionModal.reason)}
                                disabled={!rejectionModal.reason.trim() || isActioning}
                            >
                                {isActioning ? 'Processing...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="modal-header">
                            <h3 className="font-bold">Remove Instructor?</h3>
                            <button
                                className="close-btn"
                                onClick={() => setDeleteModal({ show: false, instructorId: null, name: '' })}
                            >
                                <AlertCircle size={20} />
                            </button>
                        </div>
                        <div className="modal-body text-center">
                            <div className="modal-icon warning">
                                <AlertCircle size={40} />
                            </div>
                            <p className="mb-4">Are you sure you want to remove <strong>{deleteModal.name}</strong>?</p>
                            <p className="text-secondary text-sm">They will be demoted to a student role and their instructor records will be archived.</p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-outline"
                                onClick={() => setDeleteModal({ show: false, instructorId: null, name: '' })}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary destructive"
                                onClick={handleRemoveInstructor}
                                disabled={isActioning}
                                style={{ backgroundColor: 'var(--error)', borderColor: 'var(--error)' }}
                            >
                                {isActioning ? 'Removing...' : 'Yes, Remove Instructor'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminInstructors;
