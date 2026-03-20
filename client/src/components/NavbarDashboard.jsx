import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Sun, Moon, Menu } from 'lucide-react';

const NavbarDashboard = ({ toggleSidebar, showLogo = false, hideMenu = false }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const dashboardLink = user?.role === 'admin' ? '/admin/dashboard' :
        user?.role === 'instructor' ? '/instructor/dashboard' :
            '/student/dashboard';

    return (
        <header className="dashboard-header">
            <div className="navbar-left">
                {showLogo && (
                    <Link to={dashboardLink} className="navbar-brand-logo" style={{ display: 'flex', alignItems: 'center', marginRight: '1rem' }}>
                        <img src="/logo.png" alt="XOON" style={{ height: '32px', objectFit: 'contain' }} />
                    </Link>
                )}
                {!hideMenu && (
                    <button
                        className="navbar-hamburger"
                        onClick={toggleSidebar}
                        aria-label="Toggle sidebar"
                    >
                        <Menu size={20} />
                    </button>
                )}
                <h1 className="navbar-page-title">
                    {user?.role === 'admin' ? 'Admin Panel' : user?.role === 'instructor' ? 'Instructor Panel' : ''}
                </h1>
            </div>

            <div className="navbar-right">
                {/* Theme toggle */}
                <button
                    className="navbar-theme-btn"
                    onClick={toggleTheme}
                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
                </button>

                {/* User Info */}
                <div className="navbar-user-info">
                    <div className="navbar-user-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 'bold' }}>
                        {user?.profileImage ? (
                            <img
                                src={`${user.profileImage.split('?')[0]}${user.profileImage.includes('?') ? '&' : '?'}t=${new Date(user.updatedAt || Date.now()).getTime()}`}
                                alt={user?.name}
                                style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px', maxWidth: '40px', maxHeight: '40px', objectFit: 'cover', borderRadius: '50%', overflow: 'hidden', display: 'block', margin: 0, padding: 0 }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.currentTarget.parentElement.innerText = user?.name?.charAt(0).toUpperCase() || 'U';
                                }}
                            />
                        ) : (
                            user?.name?.charAt(0).toUpperCase() || 'U'
                        )}
                    </div>
                </div>

                {/* Logout */}
                <button
                    className="navbar-logout-btn"
                    onClick={handleLogout}
                    title="Logout"
                >
                    <LogOut size={15} />
                    <span className="navbar-logout-text">Logout</span>
                </button>
            </div>
        </header>
    );
};

export default NavbarDashboard;
