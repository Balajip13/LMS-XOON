import { Award, Download, Eye, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const Certificates = ({ certificates = [] }) => {
    const { api } = useAuth();

    const handleDownload = async (courseId, studentName, courseTitle) => {
        try {
            const response = await api.get(`/certificates/${courseId}`, {
                responseType: 'blob'
            });

            const filename = `${studentName}-${courseTitle}-Certificate.pdf`.replace(/[^a-z0-9.-]/gi, '_');
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Certificate downloaded!');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download certificate');
        }
    };

    const handleView = async (courseId) => {
        try {
            const response = await api.get(`/certificates/${courseId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            window.open(url, '_blank');
            // Note: We don't revoke here immediately as it might break the new tab
        } catch (error) {
            toast.error('Failed to view certificate');
        }
    };

    return (
        <div className="animate-in fade-in duration-500" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingBottom: '2rem' }}>
            <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text)', marginBottom: '0.5rem' }}>Your Certifications</h1>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Download and share your achievements with the world.</p>
            </div>

            {certificates.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                    {certificates.map((cert) => (
                        <div key={cert._id} style={{
                            backgroundColor: 'var(--surface)',
                            borderRadius: '20px',
                            border: '1px solid var(--border)',
                            padding: '1.75rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                            transition: 'transform 0.2s ease',
                            cursor: 'default'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '16px',
                                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                                    color: 'var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Award size={28} />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cert ID</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: '600' }}>{cert.certificateId}</div>
                                </div>
                            </div>

                            <div>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: '800', fontSize: '1.15rem', color: 'var(--text)', lineHeight: '1.4' }}>{cert.courseTitle}</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        By <span style={{ color: 'var(--text)', fontWeight: '600' }}>{cert.instructorName}</span>
                                    </p>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        Earned on {new Date(cert.issueDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0 -0.5rem' }} />

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => handleView(cert.course)}
                                    className="btn btn-outline"
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                >
                                    <Eye size={18} /> View
                                </button>
                                <button
                                    onClick={() => handleDownload(cert.course, cert.studentName, cert.courseTitle)}
                                    className="btn btn-primary"
                                    style={{ flex: 1.5, padding: '0.75rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                >
                                    <Download size={18} /> Download
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{
                    backgroundColor: 'var(--surface)',
                    borderRadius: '16px',
                    border: '1px solid var(--border)',
                    padding: '5rem 2rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '24px', backgroundColor: 'var(--surface-hover)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', opacity: 0.5 }}>
                        <Award size={40} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text)' }}>No certificates earned yet</h3>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '360px', margin: '0 auto', fontWeight: '500', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        Complete your enrolled courses and pass the final assessments to unlock your professional certifications.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Certificates;
