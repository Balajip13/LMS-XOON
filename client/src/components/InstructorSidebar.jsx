import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    FileText,
    CheckSquare,
    IndianRupee,
    Star,
    BarChart2,
    MessageSquare,
    Settings,
    LogOut,
    X,
    PlusCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const InstructorSidebar = ({ isOpen, toggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const menuItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/instructor/dashboard' },
        { label: 'My Courses', icon: BookOpen, path: '/instructor/courses' },
        { label: 'Create Course', icon: PlusCircle, path: '/instructor/courses/new' },
        { label: 'Students', icon: Users, path: '/instructor/students' },
        { label: 'Assignments', icon: FileText, path: '/instructor/assignments' },
        { label: 'Quizzes', icon: CheckSquare, path: '/instructor/quizzes' },
        { label: 'Earnings', icon: IndianRupee, path: '/instructor/earnings' },
        { label: 'Reviews', icon: Star, path: '/instructor/reviews' },
        { label: 'Reports', icon: BarChart2, path: '/instructor/reports' },
        { label: 'Messages', icon: MessageSquare, path: '/instructor/messages' },
        { label: 'Settings', icon: Settings, path: '/instructor/settings' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
                onClick={toggleSidebar}
            />

            <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
                {/* Header: brand + close button */}
                <div className="sidebar-header">
                    <Link to="/instructor/dashboard" className="sidebar-brand">
                        <span className="sidebar-brand-primary">XOON</span>
                        <span className="sidebar-brand-secondary">Instructor</span>
                    </Link>
                    {/* Close button — only visible on mobile via CSS */}
                    <button
                        className="sidebar-close-btn"
                        onClick={toggleSidebar}
                        aria-label="Close sidebar"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Navigation menu */}
                <nav className="sidebar-menu">
                    {menuItems.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.path}
                            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                            onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button
                        onClick={handleLogout}
                        className="sidebar-item logout-btn"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default InstructorSidebar;
