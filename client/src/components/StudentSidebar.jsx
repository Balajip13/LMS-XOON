import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Award,
    CreditCard,
    Headset,
    Settings,
    LogOut,
    GraduationCap,
    X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StudentSidebar = ({ isOpen, toggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const studentMenu = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
        { label: 'My Learning', icon: BookOpen, path: '/student/my-learning' },
        { label: 'Certificates', icon: Award, path: '/student/certificates' },
        { label: 'Payments', icon: CreditCard, path: '/student/payments' },
        { label: 'Help', icon: Headset, path: '/student/support' },
        { label: 'Settings', icon: Settings, path: '/student/settings' },
    ];

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={toggleSidebar} />
            <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <Link to="/student/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src="/logo.png" alt="XOON" style={{ height: '40px', objectFit: 'contain' }} />
                    </Link>
                    <button className="mobile-only" onClick={toggleSidebar} style={{ marginLeft: 'auto', background: 'none', border: 'none', display: 'none' }}>
                        <X size={24} />
                    </button>
                </div>
                <div className="sidebar-menu">
                    {studentMenu.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.path}
                            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                            onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </div>
                <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border)', padding: '1rem' }}>
                    <div className="sidebar-user-profile" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', padding: '0.5rem' }}>
                        <div className="sidebar-user-avatar" style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}>
                            {user?.profilePic ? (
                                <img
                                    src={user.profilePic}
                                    alt={user?.name}
                                    style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px', maxWidth: '40px', maxHeight: '40px', objectFit: 'cover', borderRadius: '50%', overflow: 'hidden', display: 'block', margin: 0, padding: 0 }}
                                    onError={(e) => {
                                        e.target.src = '/default-avatar.png';
                                    }}
                                />
                            ) : (
                                <img src="/default-avatar.png" alt="Default Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                        </div>
                        <div className="sidebar-user-info" style={{ overflow: 'hidden' }}>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.name || 'Student'}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Student
                            </p>
                        </div>
                    </div>

                    <button onClick={handleLogout} className="sidebar-item" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', marginBottom: '0.5rem' }}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            <style>{`
                @media (max-width: 1024px) {
                    .mobile-only { display: block !important; }
                    .sidebar-user-avatar img.profile-img, .sidebar-user-avatar .profile-fallback {
                        width: 32px !important;
                        height: 32px !important;
                        font-size: 1rem !important;
                    }
                }
            `}</style>
        </>
    );
};

export default StudentSidebar;
