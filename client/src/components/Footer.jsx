import { Link, useNavigate } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Youtube, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Footer = () => {
    const { user, api } = useAuth();
    const navigate = useNavigate();

    const getDashboardLink = (path, publicPath) => {
        if (!user) return publicPath;
        if (user.role === 'admin') return `/admin/${path === 'courses' ? 'courses' : path}`;
        if (user.role === 'instructor') return `/instructor/${path === 'courses' ? 'courses' : path}`;
        return `/student/${path}`;
    };

    const handleQuickLink = (e, path, publicPath) => {
        e.preventDefault();
        navigate(getDashboardLink(path, publicPath));
    };
    return (
        <footer style={{ backgroundColor: '#2d3748', borderTop: '1px solid #1a202c', marginTop: 'auto', paddingTop: '4rem', paddingBottom: '2rem' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>

                    {/* Left: Logo & Description */}
                    <div>
                        <Link to="/" style={{ display: 'block', marginBottom: '1rem' }}>
                            <img src="/logo.png" alt="XOON LMS" style={{ height: '50px' }} />
                        </Link>
                        <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                            Empowering learners with world-class education. Join the revolution in online learning and achieve your career goals with Xoon Infotech.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {/* Redirects to login pages as requested */}
                            <a href="https://www.instagram.com/accounts/login/" target="_blank" rel="noopener noreferrer" style={{ color: '#cbd5e1', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#e2e8f0'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}><Instagram size={20} /></a>
                            <a href="https://www.youtube.com/account" target="_blank" rel="noopener noreferrer" style={{ color: '#cbd5e1', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#e2e8f0'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}><Youtube size={20} /></a>
                            <a href="https://wa.me/919XXXXXXXXX" target="_blank" rel="noopener noreferrer" style={{ color: '#cbd5e1', transition: 'color 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#e2e8f0'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>
                                {/* Custom WhatsApp-like SVG to match Lucide style */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                                    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /> {/* Simplified internal detail */}
                                </svg>
                            </a>
                            <a href="https://www.facebook.com/login/" target="_blank" rel="noopener noreferrer" style={{ color: '#cbd5e1', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#e2e8f0'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}><Facebook size={20} /></a>
                            <a href="https://www.linkedin.com/login" target="_blank" rel="noopener noreferrer" style={{ color: '#cbd5e1', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#e2e8f0'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}><Linkedin size={20} /></a>
                        </div>
                    </div>

                    {/* Middle: Links */}
                    <div>
                        <h4 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'white' }}>Quick Links</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <li><Link to="/about" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#e2e8f0'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>About Us</Link></li>
                            <li><Link to="/courses" onClick={(e) => handleQuickLink(e, 'courses', '/courses')} style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#e2e8f0'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>Courses</Link></li>
                            <li><Link to="/contact" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#e2e8f0'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>Contact</Link></li>
                            <li><Link to="/faq" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#e2e8f0'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>FAQ</Link></li>
                            <li><Link to="/privacy-policy" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#e2e8f0'} onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}>Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'white' }}>Newsletter</h4>
                        <p style={{ color: '#cbd5e1', marginBottom: '1rem' }}>Subscribe to get latest updates and offers.</p>
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
                                placeholder="Enter your email"
                                style={{
                                    flex: '1 1 auto',
                                    minWidth: 0,
                                    backgroundColor: '#1a202c',
                                    border: '1px solid #4a5568',
                                    color: 'white',
                                    padding: '0.75rem',
                                    borderRadius: '6px',
                                    outline: 'none'
                                }}
                            />
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', backgroundColor: '#4f46e5', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>

                <div style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid #4a5568', color: '#cbd5e1', fontSize: '0.85rem' }}>
                    &copy; {new Date().getFullYear()} Xoon Infotech. All rights reserved.
                </div>
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
        </footer>
    );
};

export default Footer;
