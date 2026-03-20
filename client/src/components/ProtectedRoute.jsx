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

    // Check for instructor application intent first
    const applyInstructorIntent = localStorage.getItem('applyInstructorIntent');
    
    // If user has instructor intent and is trying to access apply-instructor page, allow it
    if (applyInstructorIntent === 'true' && location.pathname === '/apply-instructor') {
        return children;
    }

    // Block dashboard access for pending instructor users
    if (user?.instructorRequestStatus === 'pending' && location.pathname.startsWith('/student/')) {
        return <Navigate to="/apply-instructor" replace />;
    }

    // If specific roles are required, check user role with hierarchy
    if (allowedRoles.length > 0 && !hasAllowedRole(user?.role, allowedRoles)) {
        console.log('[ProtectedRoute] access denied', {
            path: location.pathname,
            userRole: normalizeRole(user?.role),
            allowedRoles: allowedRoles.map(normalizeRole),
        });
        // Show access denied component instead of redirecting
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: 'var(--background)',
                flexDirection: 'column',
                gap: '1rem',
                padding: '2rem',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: 'var(--error)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '2rem'
                }}>
                    ⚠️
                </div>
                <h2 style={{ color: 'var(--text)', margin: 0 }}>
                    Access Denied
                </h2>
                <p style={{ 
                    color: 'var(--text-secondary)', 
                    margin: 0,
                    maxWidth: '400px',
                    lineHeight: 1.5
                }}>
                    You don't have permission to access this page. 
                    Required roles: {allowedRoles.join(' or ')}.
                    Your role: {user?.role || 'Unknown'}.
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        onClick={() => window.history.back()}
                        style={{
                            padding: '0.75rem 2rem',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}
                    >
                        Go Back
                    </button>
                    <button
                        onClick={() => {
                            const role = normalizeRole(user?.role);
                            const dashboardPath =
                                role === 'admin' ? '/admin-dashboard' :
                                role === 'instructor' ? '/teacher-dashboard' :
                                '/dashboard';
                            window.location.href = dashboardPath;
                        }}
                        style={{
                            padding: '0.75rem 2rem',
                            backgroundColor: 'var(--surface)',
                            color: 'var(--text)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // If all checks pass, render the protected content
    return children;
};

export default ProtectedRoute;
