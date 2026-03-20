import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Youtube, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const DashboardFooter = () => {
    const { api } = useAuth();
    return (
        <footer style={{
            backgroundColor: 'var(--surface)',
            borderTop: '1px solid var(--border)',
            marginTop: 'auto',
            paddingTop: '3rem',
            paddingBottom: '2rem',
            width: '100%'
        }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>

                    {/* Left: Logo & Description */}
                    <div style={{ gridColumn: 'span 1' }}>
                        <Link to="/" style={{ display: 'block', marginBottom: '1rem' }}>
                            <img src="/logo.png" alt="XOON LMS" style={{ height: '40px' }} />
                        </Link>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                            Empowering learners with world-class education. Join the revolution in online learning.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <a href="#" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}><Instagram size={18} /></a>
                            <a href="#" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}><Youtube size={18} /></a>
                            <a href="#" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}><Facebook size={18} /></a>
                            <a href="#" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}><Linkedin size={18} /></a>
                        </div>
                    </div>

                    {/* Middle: Links */}
                    <div>
                        <h4 style={{ marginBottom: '1.25rem', fontSize: '1rem', color: 'var(--text)', fontWeight: '700' }}>Quick Links</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: 0 }}>
                            {[
                                { label: 'About Us', path: '/about' },
                                { label: 'Contact', path: '/contact' },
                                { label: 'FAQ', path: '/faq' },
                                { label: 'Privacy Policy', path: '/privacy-policy' }
                            ].map(item => (
                                <li key={item.label}>
                                    <Link
                                        to={item.path}
                                        style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600', transition: 'color 0.2s' }}
                                        onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
                                        onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 style={{ marginBottom: '1.25rem', fontSize: '1rem', color: 'var(--text)', fontWeight: '700' }}>Support</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: 0 }}>
                            <li><Link to="/student/support" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>Help Center</Link></li>
                            <li><Link to="/courses" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>Courses</Link></li>
                            <li><Link to="/pricing" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>Pricing</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 style={{ marginBottom: '1.25rem', fontSize: '1rem', color: 'var(--text)', fontWeight: '700' }}>Newsletter</h4>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const email = e.target.elements.newsletterEmail.value;
                                if (!email) return;
                                try {
                                    const response = await api.post('/newsletter', { email });
                                    if (response.data.success) {
                                        toast.success(response.data.message);
                                        e.target.reset();
                                    } else {
                                        toast.error(response.data.message);
                                    }
                                } catch (error) {
                                    toast.error(error.response?.data?.message || 'Subscription failed');
                                }
                            }}
                            style={{ display: 'flex', gap: '0.5rem', width: '100%', alignItems: 'center' }}
                            className="newsletter-form-mobile"
                        >
                            <input
                                name="newsletterEmail"
                                type="email"
                                required
                                placeholder="Email"
                                style={{
                                    flex: '1 1 auto',
                                    minWidth: 0,
                                    backgroundColor: 'var(--background)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text)',
                                    padding: '0.6rem 0.8rem',
                                    borderRadius: '8px',
                                    outline: 'none',
                                    fontSize: '0.85rem'
                                }}
                            />
                            <button
                                type="submit"
                                style={{ padding: '0.6rem', backgroundColor: 'var(--primary)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </div>
                </div>

                <div style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '600' }}>
                    &copy; {new Date().getFullYear()} Xoon Infotech. All rights reserved.
                </div>
                <style>{`
                @media (max-width: 768px) {
                    .newsletter-form-mobile {
                        flex-direction: column !important;
                    }
                    .newsletter-form-mobile input, .newsletter-form-mobile button {
                        width: 100% !important;
                    }
                }
            `}</style>
            </div>
        </footer >
    );
};

export default DashboardFooter;
