import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    Layers,
    CheckSquare,
    CreditCard,
    Award,
    BarChart,
    Headset,
    Settings,
    LogOut,
    Mail,
    Send,
    X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const adminMenu = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { label: 'Users', icon: Users, path: '/admin/users' },
        { label: 'Instructors', icon: GraduationCap, path: '/admin/instructors' },
        { label: 'Courses', icon: BookOpen, path: '/admin/courses' },
        { label: 'Categories', icon: Layers, path: '/admin/categories' },
        { label: 'Enrollments', icon: CheckSquare, path: '/admin/enrollments' },
        { label: 'Payments', icon: CreditCard, path: '/admin/payments' },
        { label: 'Reviews', icon: Award, path: '/admin/reviews' },
        { label: 'Reports', icon: BarChart, path: '/admin/reports' },
        { label: 'Support', icon: Headset, path: '/admin/support' },
        { label: 'Settings', icon: Settings, path: '/admin/settings' },
    ];

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={toggleSidebar} />
            <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src="/logo.png" alt="XOON" style={{ height: '40px', objectFit: 'contain', filter: 'brightness(var(--logo-brightness))' }} />
                    </Link>
                    <button
                        className="mobile-close-btn"
                        onClick={toggleSidebar}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="sidebar-menu">
                    {adminMenu.map((item, index) => (
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
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="sidebar-item" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', marginBottom: '1.5rem' }}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            <style>{`
                .mobile-close-btn { display: none; }
                @media (max-width: 1024px) {
                    .mobile-close-btn { display: block; }
                }
            `}</style>
        </>
    );
};

export default AdminSidebar;
