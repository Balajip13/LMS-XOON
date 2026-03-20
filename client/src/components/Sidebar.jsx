import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Award,
    CreditCard,
    CircleHelp,
    Settings,
    LogOut,
    X,
    Users,
    GraduationCap,
    Headset,
    BarChart,
    Layers,
    Layers,
    CheckSquare,
    Mail,
    Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const role = user?.role || 'student';

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

    if (user?.instructorRequestStatus !== 'approved') {
        studentMenu.splice(1, 0, {
            label: user?.instructorRequestStatus === 'pending' ? 'Application Status' :
                user?.instructorRequestStatus === 'rejected' ? 'Re-apply to Teach' : 'Become Instructor',
            icon: GraduationCap,
            path: '/apply-instructor'
        });
    }

    const menuConfigs = {
        student: studentMenu,
        instructor: [
            { label: 'Dashboard', icon: LayoutDashboard, path: '/instructor/dashboard' },
            { label: 'My Courses', icon: BookOpen, path: '/instructor/courses' },
            { label: 'Reports', icon: BarChart, path: '/instructor/reports' },
            { label: 'Settings', icon: Settings, path: '/instructor/settings' },
        ],
        admin: [
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
        ]
    };

    const menuItems = menuConfigs[role] || menuConfigs.student;

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
                onClick={toggleSidebar}
            />

            <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src="/logo.png" alt="XOON" style={{ height: '40px', objectFit: 'contain' }} />
                    </Link>
                    <button className="mobile-only" onClick={toggleSidebar} style={{ marginLeft: 'auto', background: 'none', border: 'none', display: 'none' }}>
                        <X size={24} />
                    </button>
                </div>

                <div className="sidebar-menu">
                    {menuItems.map((item, index) => (
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
                    <button
                        onClick={handleLogout}
                        className="sidebar-item"
                        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', marginBottom: '1.5rem' }}
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>

                </div>
            </aside>

            <style>{`
                @media (max-width: 1024px) {
                    .mobile-only { display: block !important; }
                }
            `}</style>
        </>
    );
};

export default Sidebar;
