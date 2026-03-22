import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const normalizeRole = (role) => String(role || '').trim().toLowerCase();

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    if (user) {
        // Login/Register must stay mounted after auth so Login.jsx can run post-login navigation
        // (apply-instructor intent, pending status, role). Do not redirect away from these paths.
        if (location.pathname === '/login' || location.pathname === '/register') {
            return children;
        }

        const role = normalizeRole(user?.role);

        const dashboardPath =
            role === 'admin' ? '/admin-dashboard' :
            role === 'instructor' ? '/teacher-dashboard' :
            '/dashboard';

        return <Navigate to={dashboardPath} replace />;
    }

    return children;
};

export default PublicRoute;
