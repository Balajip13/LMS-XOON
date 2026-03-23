import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Sun, Moon, Menu, X, LayoutDashboard, BookOpen, Award, History, User, PlusCircle, Users, BarChart3, Search } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // State 1: Public - Guest
    const getGuestLinks = () => (
        <>
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/courses" className="nav-link">Courses</Link>
            <Link to="/pricing" className="nav-link">Pricing</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
        </>
    );

    // State 2: Student
    const getStudentLinks = () => (
        <>
            <Link to="/student/dashboard" className="nav-link"><LayoutDashboard size={18} /> Dashboard</Link>
            <Link to="/student/my-learning" className="nav-link"><BookOpen size={18} /> My Learning</Link>
            <Link to="/student/courses" className="nav-link"><Search size={18} /> Explore</Link>
            <Link to="/student/certificates" className="nav-link"><Award size={18} /> Certificates</Link>
            <Link to="/student/settings" className="nav-link"><User size={18} /> Profile</Link>
        </>
    );

    // State 3: Instructor
    const getInstructorLinks = () => (
        <>
            <Link to="/instructor/dashboard" className="nav-link"><LayoutDashboard size={18} /> Instructor Dashboard</Link>
            <Link to="/instructor/courses" className="nav-link"><BookOpen size={18} /> My Courses</Link>
            <Link to="/instructor/courses/new" className="nav-link"><PlusCircle size={18} /> Add Course</Link>
            <Link to="/instructor/students" className="nav-link"><Users size={18} /> Students</Link>
            <Link to="/instructor/earnings" className="nav-link"><BarChart3 size={18} /> Earnings</Link>
        </>
    );

    const renderNavLinks = () => {
        if (!user) return getGuestLinks();
        if (user.role === 'student') return getStudentLinks();
        if (user.role === 'instructor') return getInstructorLinks();
        if (user.role === 'admin') return (
            <>
                <Link to="/admin/dashboard" className="nav-link">Admin Dashboard</Link>
                <Link to="/admin/users" className="nav-link">Users</Link>
                <Link to="/admin/courses" className="nav-link">Courses</Link>
            </>
        );
        return null;
    };

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

                {/* Desktop Menu */}
                <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginRight: '1rem' }}>
                        {renderNavLinks()}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
                        {user ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="hidden md:flex">
                                    <div style={{ position: 'relative' }}>
                                        {user?.profilePic ? (
                                            <img
                                                src={user.profilePic}
                                                alt={user.name}
                                                style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                                                onError={(e) => { e.target.src = '/default-avatar.png'; }}
                                            />
                                        ) : (
                                            <img src="/default-avatar.png" alt="Default Avatar" style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }} />
                                        )}
                                    </div>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{user.name}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        color: 'var(--error)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        border: '1px solid var(--error)',
                                        borderRadius: '8px',
                                        padding: '0.5rem 1rem',
                                        backgroundColor: 'transparent',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="btn" style={{
                                backgroundColor: '#2563eb',
                                color: 'white',
                                padding: '0.5rem 1.5rem',
                                borderRadius: '8px',
                                fontWeight: 600,
                                textDecoration: 'none'
                            }}>Login</Link>
                        )}
                        <button
                            onClick={toggleTheme}
                            style={{
                                color: 'var(--text-secondary)',
                                backgroundColor: 'transparent',
                                border: 'none',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                borderRadius: '50%'
                            }}
                            title="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="mobile-toggle" style={{ alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={toggleTheme} style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
                    </button>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="mobile-menu" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'var(--surface)',
                    padding: '1.5rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    {renderNavLinks()}
                    <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0.5rem 0' }} />
                    {user ? (
                        <>
                            <div style={{ fontWeight: 600 }}>Hi, {user.name}</div>
                            <button onClick={handleLogout} className="btn" style={{ backgroundColor: 'var(--error)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <LogOut size={18} /> Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="btn" onClick={() => setIsMenuOpen(false)} style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.75rem', borderRadius: '8px', textAlign: 'center', fontWeight: 600 }}>
                            Login
                        </Link>
                    )}
                </div>
            )}

            <style>{`
                .nav-link {
                    color: var(--text-secondary);
                    text-decoration: none;
                    font-weight: 500;
                    font-size: 0.95rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: color 0.2s;
                }
                .nav-link:hover {
                    color: var(--primary);
                }
                /* Desktop: show desktop menu, hide mobile toggle */
                .desktop-menu { display: flex; }
                .mobile-toggle { display: none; }

                @media (max-width: 992px) {
                    .desktop-menu { display: none !important; }
                    .mobile-toggle { display: flex !important; }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
