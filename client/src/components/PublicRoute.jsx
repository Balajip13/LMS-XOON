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
        // Check for instructor application intent first - this should override role-based redirects
        const applyInstructorIntent = localStorage.getItem('applyInstructorIntent');
        const role = normalizeRole(user?.role);
        console.log('DEBUG: PublicRoute - applyInstructorIntent:', applyInstructorIntent);
        console.log('DEBUG: PublicRoute - user.role (normalized):', role);
        console.log('DEBUG: PublicRoute - location.state?.from:', location.state?.from);

        // If user has instructor intent, allow them to proceed to the intended page
        if (applyInstructorIntent === 'true') {
            console.log('DEBUG: PublicRoute - Allowing redirect due to instructor intent');
            // Get the intended destination from location state
            const from = location.state?.from?.pathname || location.state?.from || '/apply-instructor';
            return <Navigate to={from} replace />;
        }

        // If user is logged in and tries to access public routes (like /, /login, /register),
        // redirect them to their specific dashboard.
        const dashboardPath =
            role === 'admin' ? '/admin-dashboard' :
            role === 'instructor' ? '/teacher-dashboard' :
            '/dashboard';

        // If they came from a specific page, return them there, otherwise go to dashboard
        const from = location.state?.from?.pathname || location.state?.from || dashboardPath;
        console.log('DEBUG: PublicRoute - Redirecting to:', from);
        return <Navigate to={from} replace />;
    }

    return children;
};

export default PublicRoute;
