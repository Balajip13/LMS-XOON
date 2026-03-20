import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Menu, X } from 'lucide-react';

const NavbarPublic = () => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const coursesPath = user ? (user.role === 'admin' ? '/admin/courses' : '/student/courses') : '/courses';

    return (
        <nav style={{
            padding: '0.75rem 0',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--surface)',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            height: '70px',
            display: 'flex',
            alignItems: 'center'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img src="/logo.png" alt="XOON" style={{ height: '48px', objectFit: 'contain' }} />
                </Link>

                <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to={coursesPath} className="nav-link">Courses</Link>
                        <Link to="/pricing" className="nav-link">Pricing</Link>
                        <Link to="/contact" className="nav-link">Contact</Link>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link to="/login" className="btn btn-primary btn-login-nav">Login</Link>
                        <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </div>

                <div className="mobile-toggle" style={{ alignItems: 'center', gap: '0.25rem' }}>
                    <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.5rem', display: 'flex', alignItems: 'center' }}>
                        {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
                    </button>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.5rem', display: 'flex', alignItems: 'center' }}>
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="mobile-menu" style={{
                    position: 'absolute', top: '70px', left: 0, right: 0,
                    backgroundColor: 'var(--surface)', padding: '1.5rem',
                    display: 'flex', flexDirection: 'column', gap: '1rem',
                    borderBottom: '1px solid var(--border)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
                    <Link to={coursesPath} className="nav-link" onClick={() => setIsMenuOpen(false)}>Courses</Link>
                    <Link to="/pricing" className="nav-link" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
                    <Link to="/contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>Contact</Link>
                    <Link to="/login" className="btn btn-primary btn-login-nav" style={{ textAlign: 'center' }} onClick={() => setIsMenuOpen(false)}>Login</Link>
                </div>
            )}

            <style>{`
                .nav-link { color: var(--text-secondary); text-decoration: none; font-weight: 500; }
                .nav-link:hover { color: var(--primary); }
                .btn-login-nav { 
                    padding: 0.4rem 1.25rem !important; 
                    font-size: 0.875rem !important;
                    min-height: auto;
                }
                /* Desktop default */
                .desktop-menu { display: flex; }
                .mobile-toggle { display: none; }

                @media (max-width: 768px) {
                    .desktop-menu { display: none !important; }
                    .mobile-toggle { display: flex !important; }
                }
            `}</style>
        </nav>
    );
};

export default NavbarPublic;
