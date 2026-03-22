import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const normalizeRole = (role) => String(role || '').trim().toLowerCase();

// Strict role check (no hierarchy): userRole must be explicitly allowed
const hasAllowedRole = (userRole, allowedRoles) => {
    const role = normalizeRole(userRole);
    if (!role) return false;
    return allowedRoles.map(normalizeRole).includes(role);
};

const ProtectedRoute = ({ 
    children, 
    allowedRoles = [], 
    redirectTo = '/login',
    fallback = null 
}) => {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: 'var(--background)',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Checking authentication...
                </p>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return (
            <Navigate 
                to={redirectTo} 
                state={{ from: location }} 
                replace 
            />
        );
    }

    // Pending / rejected instructor flow: keep on application page instead of student dashboard
    const instStatus = user?.instructorRequestStatus;
    const onStudentHome =
        location.pathname.startsWith('/student') ||
        location.pathname === '/dashboard';
    if ((instStatus === 'pending' || instStatus === 'rejected') && onStudentHome) {
        return <Navigate to="/apply-instructor" replace />;
    }

    // If all checks pass, render the protected content
    return children;
};

export default ProtectedRoute;
