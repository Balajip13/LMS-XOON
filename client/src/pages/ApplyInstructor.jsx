import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    GraduationCap,
    Send,
    CheckCircle,
    Clock,
    XCircle,
    UploadCloud,
    FileText,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

/* ─── inline styles ─────────────────────────────────────────────────────── */
const s = {
    page: {
        backgroundColor: 'var(--background)',
        minHeight: '100vh',
        color: 'var(--text)',
    },
    header: {
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '1rem 2rem',
    },
    headerInner: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    body: {
        padding: '2rem',
        maxWidth: '800px',
        margin: '0 auto',
    },
    card: {
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-sm)',
    },
    heroIcon: {
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        backgroundColor: 'rgba(79,70,229,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.5rem',
        color: 'var(--primary)',
    },
    h1: {
        fontSize: '2rem',
        fontWeight: '800',
        marginBottom: '0.75rem',
        color: 'var(--text)',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: '1rem',
        color: 'var(--text-secondary)',
        textAlign: 'center',
        marginBottom: '2rem',
        lineHeight: 1.6,
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        color: 'var(--text-secondary)',
        fontSize: '0.875rem',
        fontWeight: '500',
    },
    input: {
        width: '100%',
        padding: '0.75rem 1rem',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--background)',
        outline: 'none',
        fontSize: '0.9rem',
        fontFamily: 'inherit',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    textarea: {
        width: '100%',
        padding: '0.85rem 1rem',
        borderRadius: '10px',
        border: '1.5px solid var(--border)',
        backgroundColor: 'var(--background)',
        color: 'var(--text)',
        fontSize: '0.95rem',
        outline: 'none',
        resize: 'vertical',
        minHeight: '130px',
        lineHeight: 1.6,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
    },
    errorText: {
        fontSize: '0.82rem',
        color: 'var(--error)',
        marginTop: '0.4rem',
    },
};

/* ─── Focus Components ────────────────────────────────────────────────────── */
const FocusInput = ({ style = {}, ...props }) => {
    const [focused, setFocused] = useState(false);
    return (
        <input
            {...props}
            style={{
                ...style,
                borderColor: focused ? 'var(--primary)' : 'var(--border)',
                boxShadow: focused ? '0 0 0 3px rgba(79,70,229,0.12)' : 'none',
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
        />
    );
};

const FocusTextarea = ({ style = {}, ...props }) => {
    const [focused, setFocused] = useState(false);
    return (
        <textarea
            {...props}
            style={{
                ...style,
                borderColor: focused ? 'var(--primary)' : 'var(--border)',
                boxShadow: focused ? '0 0 0 3px rgba(79,70,229,0.12)' : 'none',
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
        />
    );
};

const FocusSelect = ({ style = {}, ...props }) => {
    const [focused, setFocused] = useState(false);
    return (
        <select
            {...props}
            style={{
                ...s.input,
                borderColor: focused ? 'var(--primary)' : 'var(--border)',
                boxShadow: focused ? '0 0 0 3px rgba(79,70,229,0.12)' : 'none',
                appearance: 'none',
                cursor: 'pointer',
                ...style,
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
        />
    );
};

/* ─── Upload Drop Zone ──────────────────────────────────────────────────── */
const UploadZone = ({ file, onFile, onRemove, error }) => {
    const ref = useRef(null);
    const [drag, setDrag] = useState(false);

    const validate = (f) => {
        if (!f) return null;
        const ext = f.name.slice(f.name.lastIndexOf('.')).toLowerCase();
        if (!['.pdf', '.doc', '.docx'].includes(ext)) return 'Only PDF, DOC, or DOCX files are allowed.';
        if (f.size > 5 * 1024 * 1024) return 'File size must be under 5 MB.';
        return null;
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files[0];
        if (!f) return;
        onFile(f, validate(f));
    };

    const handleChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        onFile(f, validate(f));
        e.target.value = '';
    };

    const borderColor = error ? 'var(--error)' : drag ? 'var(--primary)' : file ? 'var(--success)' : 'var(--border)';
    const bgColor = drag
        ? 'rgba(79,70,229,0.05)'
        : file
            ? 'rgba(16,185,129,0.04)'
            : error
                ? 'rgba(239,68,68,0.03)'
                : 'var(--background)';

    return (
        <div>
            <div
                onClick={() => ref.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={handleDrop}
                style={{
                    border: `2px dashed ${borderColor}`,
                    borderRadius: '14px',
                    padding: '2.25rem 1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: bgColor,
                    transition: 'border-color 0.2s, background-color 0.2s',
                    position: 'relative',
                }}
            >
                {file ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '10px',
                            backgroundColor: 'rgba(16,185,129,0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            <FileText size={20} color="var(--success)" />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <p style={{ margin: 0, fontWeight: 600, color: 'var(--success)', fontSize: '0.95rem' }}>{file.name}</p>
                            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                {(file.size / 1024).toFixed(0)} KB · Ready to upload
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onRemove(); }}
                            style={{
                                marginLeft: 'auto',
                                background: 'rgba(239,68,68,0.1)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.35rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--error)',
                                transition: 'background 0.2s',
                            }}
                            title="Remove file"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '14px',
                            backgroundColor: drag ? 'rgba(79,70,229,0.12)' : 'rgba(79,70,229,0.07)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1rem', transition: 'background 0.2s',
                        }}>
                            <UploadCloud size={26} color={drag ? 'var(--primary)' : 'var(--text-muted)'} />
                        </div>
                        <p style={{ margin: '0 0 0.3rem', fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
                            {drag ? 'Drop your file here' : 'Upload Your Resume'}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            PDF, DOC, DOCX &nbsp;·&nbsp; Max 5 MB
                        </p>
                        <p style={{ margin: '0.6rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Click to browse or drag &amp; drop here
                        </p>
                    </>
                )}
            </div>
            <input ref={ref} type="file" accept=".pdf,.doc,.docx" onChange={handleChange} style={{ display: 'none' }} />
            {error && <p style={s.errorText}>⚠ {error}</p>}
        </div>
    );
};

/* ─── Main Component ─────────────────────────────────────────────────────── */
const ApplyInstructor = () => {
    console.log('ApplyInstructor component loaded');

    const { user, logout, refreshUser, api, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(true);
    const [application, setApplication] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeError, setResumeError] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        biography: '',
        expertise: '',
        experience: '',
        category: '',
        reason: '',
        portfolio: '',
        mobile: '',
    });

    useEffect(() => {
        if (user?.name) {
            setFormData((prev) => ({
                ...prev,
                fullName: prev.fullName || user.name || '',
                mobile: prev.mobile || user.mobile || '',
            }));
        }
    }, [user?.name, user?.mobile]);

    useEffect(() => {
        if (authLoading) return;
        const role = String(user?.role || '').trim().toLowerCase();
        if (role === 'instructor') {
            navigate('/teacher-dashboard', { replace: true });
            return;
        }
        if (role === 'admin') {
            navigate('/admin-dashboard', { replace: true });
            return;
        }
    }, [authLoading, user, navigate]);

    const fetchApplicationStatus = async (profileUser = user) => {
        try {
            const { data } = await api.get('/instructor/my-application');
            console.log('API response:', data);
            if (data?.success) {
                if (data.data) {
                    setApplication({
                        ...data.data,
                        resumeFileName: data.data.resumeFileName || data.data.resumeOriginalName || data.data.resume,
                    });
                    if (data.data?.status === 'approved') {
                        await refreshUser();
                        navigate('/teacher-dashboard', { replace: true });
                    }
                } else if (profileUser?.instructorRequestStatus === 'rejected') {
                    setApplication({
                        status: 'rejected',
                        rejectionReason: profileUser.rejectionReason || '',
                    });
                }
            }
        } catch (err) {
            console.error('Failed to fetch application status', err?.response?.data || err?.message);
            if (profileUser?.instructorRequestStatus === 'rejected') {
                setApplication({
                    status: 'rejected',
                    rejectionReason: profileUser.rejectionReason || '',
                });
            }
        } finally {
            setStatusLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        console.log('Role:', String(user.role || '').trim().toLowerCase());
        console.log('Status:', user.instructorRequestStatus);
    }, [user]);

    useEffect(() => {
        if (authLoading || !user?._id) return;
        const role = String(user.role || '').trim().toLowerCase();
        if (role === 'instructor' || role === 'admin') return;
        setStatusLoading(true);
        fetchApplicationStatus(user);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- run when user session is ready
    }, [authLoading, user?._id, user?.role, user?.instructorRequestStatus]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFile = (file, err) => { setResumeError(err || ''); setResumeFile(err ? null : file); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!resumeFile) { setResumeError('Resume is required. Please upload a PDF, DOC, or DOCX file.'); return; }
        setLoading(true);
        try {
            const fd = new FormData();
            Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
            if (user?.email) {
                fd.append('email', user.email);
            }
            fd.append('resume', resumeFile);
            const { data } = await api.post('/instructor/apply', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            console.log('Submit response:', data);
            if (data.success) {
                toast.success(data.message || 'Application submitted!');
                if (data.data) {
                    setApplication({
                        ...data.data,
                        resumeFileName: data.data.resumeFileName || data.data.resumeOriginalName || data.data.resume,
                    });
                }
                const updatedUser = await refreshUser();
                console.log('User after submit:', updatedUser);
            }
        } catch (error) {
            console.error('Apply API error:', error?.response?.data || error?.message);
            toast.error(error.response?.data?.message || 'Failed to submit application');
            if (error.response?.data?.data) {
                const d = error.response.data.data;
                setApplication({
                    ...d,
                    resumeFileName: d.resumeFileName || d.resumeOriginalName || d.resume,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || !user) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--background)', color: 'var(--text-secondary)' }}>
                Loading…
            </div>
        );
    }

    const role = String(user.role || '').trim().toLowerCase();
    if (role === 'instructor' || role === 'admin') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--background)', color: 'var(--text-secondary)' }}>
                Redirecting…
            </div>
        );
    }

    /* ── Loading spinner ── */
    if (statusLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--background)', flexDirection: 'column', gap: '1rem' }}>
                <div
                    style={{
                        width: '48px',
                        height: '48px',
                        border: '3px solid var(--border)',
                        borderTopColor: 'var(--primary)',
                        borderRadius: '50%',
                        animation: 'applySpin 0.8s linear infinite',
                    }}
                />
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading application status…</p>
                <style>{`@keyframes applySpin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const normalizeApplication = (app) => {
        if (!app) return null;
        return {
            ...app,
            resumeFileName: app.resumeFileName || app.resumeOriginalName || app.resume,
        };
    };

    const baseApp = normalizeApplication(application);
    const applicationView =
        baseApp ||
        (user?.instructorRequestStatus === 'rejected'
            ? { status: 'rejected', rejectionReason: user.rejectionReason || '' }
            : null);

    const pendingFromUser = user?.instructorRequestStatus === 'pending';
    const effectiveApplication =
        applicationView && (applicationView.status === 'pending' || applicationView.status === 'approved')
            ? applicationView
            : pendingFromUser
                ? {
                    status: 'pending',
                    createdAt: user.updatedAt || user.createdAt,
                    resumeFileName: user.instructorApplication?.resumeFileName || null,
                }
                : null;

    /* ── Header Component (Always Visible) ── */
    const Header = () => (
        <header style={s.header}>
            <div style={s.headerInner}>
                {/* Static logo - no navigation */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img src="/logo.png" alt="XOON" style={{ height: '38px', objectFit: 'contain', filter: 'brightness(var(--logo-brightness))', cursor: 'default' }} />
                </div>
                
                {/* Logout button */}
                <button
                    onClick={async () => {
                        await logout();
                        navigate('/');
                    }}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        fontSize: '14px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                        e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                        e.target.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                    }}
                >
                    Logout
                </button>
            </div>
        </header>
    );

    /* ── Status card (pending / approved) — also when user is pending but application fetch lagged ── */
    if (effectiveApplication) {
        const isPending = effectiveApplication.status === 'pending';
        return (
            <>
                <Header />
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)', padding: '2rem' }}>
                    <div style={{ ...s.card, maxWidth: '600px', textAlign: 'center', padding: '3.5rem' }}>
                        <div style={{ width: 72, height: 72, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isPending ? 'rgba(79,70,229,0.1)' : 'rgba(16,185,129,0.1)', margin: '0 auto 1.5rem' }}>
                            {isPending ? <Clock size={36} color="var(--primary)" /> : <CheckCircle size={36} color="var(--success)" />}
                        </div>
                        <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text)' }}>
                            {isPending ? 'Application Under Review' : 'Congratulations!'}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1rem', marginBottom: '2rem' }}>
                            {isPending
                                ? "We've received your application. Our team is reviewing it and will notify you once a decision is made."
                                : "Your application was approved! Head to your instructor dashboard to start creating courses."}
                        </p>
                        <div style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
                            {[
                                ['Status', <span style={{ fontWeight: 800, color: isPending ? 'var(--primary)' : 'var(--success)', textTransform: 'uppercase', fontSize: '0.85rem' }}>{effectiveApplication.status}</span>],
                                effectiveApplication.createdAt && ['Submitted', new Date(effectiveApplication.createdAt).toLocaleDateString()],
                                effectiveApplication.resumeFileName && ['Resume', `📄 ${effectiveApplication.resumeFileName}`],
                            ].filter(Boolean).map(([label, val]) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.88rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{val}</span>
                                </div>
                            ))}
                        </div>
                        {isPending
                            ? <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>
                                    Your application is under review
                                </p>
                            </div>
                            : <button onClick={() => navigate('/instructor/dashboard')} className="btn btn-primary" style={{ width: '100%', padding: '0.9rem' }}>Go to Instructor Dashboard</button>
                        }
                    </div>
                </div>
            </>
        );
    }

    /* ── Application Form ── */
    return (
        <>
            <Header />
            <div style={s.page}>
                <div style={s.body}>
                    <div style={s.card}>
                        {/* Hero */}
                        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                            <div style={s.heroIcon}><GraduationCap size={38} /></div>
                            <h1 style={s.h1}>Become an Instructor</h1>
                            <p style={s.subtitle}>Share your expertise and help thousands of students grow.</p>
                        </div>

                        {/* Rejection Banner */}
                        {applicationView?.status === 'rejected' && (
                            <div style={{ backgroundColor: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                                <XCircle size={20} color="var(--error)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <h4 style={{ color: 'var(--error)', margin: '0 0 0.25rem', fontWeight: 700 }}>Application Rejected</h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{applicationView.rejectionReason || 'Please update your profile and try again.'}</p>
                                    <p style={{ margin: '0.4rem 0 0', fontWeight: 600, fontSize: '0.83rem', color: 'var(--text)' }}>You can re-submit your updated application below.</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={s.label}>Full Name</label>
                                <FocusInput type="text" name="fullName" value={formData.fullName} onChange={handleChange} required style={s.input} placeholder="Your full name" />
                            </div>

                            <div>
                                <label style={s.label}>Mobile Number</label>
                                <FocusInput type="tel" name="mobile" placeholder="Enter your mobile number" value={formData.mobile || ''} onChange={handleChange} required style={s.input} />
                            </div>

                            <div>
                                <label style={s.label}>Years of Experience</label>
                                <FocusInput type="text" name="experience" placeholder="e.g. 5+ Years" value={formData.experience} onChange={handleChange} required style={s.input} />
                            </div>

                            <div>
                                <label style={s.label}>Professional Expertise</label>
                                <FocusInput type="text" name="expertise" placeholder="e.g. Full-Stack Development" value={formData.expertise} onChange={handleChange} required style={s.input} />
                            </div>

                            <div>
                                <label style={s.label}>Course Category</label>
                                <FocusSelect name="category" value={formData.category} onChange={handleChange} required>
                                    <option value="">Select Category</option>
                                    <option value="Web Development">Web Development</option>
                                    <option value="Data Science">Data Science</option>
                                    <option value="Mobile Development">Mobile Development</option>
                                    <option value="Business">Business</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Design">Design</option>
                                    <option value="Other">Other</option>
                                </FocusSelect>
                            </div>

                            {/* Biography */}
                            <div>
                                <label style={s.label}>Professional Biography</label>
                                <FocusTextarea name="biography" rows={5} placeholder="Share your background, achievements, and what makes you a great educator..." value={formData.biography} onChange={handleChange} required style={s.textarea} />
                            </div>

                            {/* Reason */}
                            <div>
                                <label style={s.label}>Why do you want to teach at Xoon?</label>
                                <FocusTextarea name="reason" rows={5} placeholder="Tell us about your teaching goals and the impact you want to make..." value={formData.reason} onChange={handleChange} required style={s.textarea} />
                            </div>

                            {/* Separator */}
                            <div style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />

                            {/* Resume Upload */}
                            <div style={{ marginBottom: '0.5rem' }}>
                                <label style={{ ...s.label, marginBottom: '0.6rem' }}>
                                    Upload Resume <span style={{ color: 'var(--error)', marginLeft: '2px' }}>*</span>
                                </label>
                                <UploadZone
                                    file={resumeFile}
                                    onFile={handleFile}
                                    onRemove={() => setResumeFile(null)}
                                    error={resumeError}
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading || user?.instructorRequestStatus === 'pending'}
                                style={{
                                    width: '100%',
                                    padding: '0.95rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    backgroundColor: 'var(--primary)',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.7 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.6rem',
                                    boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
                                    transition: 'opacity 0.2s, box-shadow 0.2s, transform 0.15s',
                                }}
                                onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                {loading ? 'Submitting…' : <><Send size={18} /> Submit Application</>}
                            </button>

                            <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                By submitting, you agree to our Instructor Terms &amp; Conditions.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ApplyInstructor;
