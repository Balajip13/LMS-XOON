import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Settings from '../models/Settings.js';

// Centralized error handler for authentication
const handleAuthError = (res, message, statusCode = 401) => {
    return res.status(statusCode).json({
        success: false,
        message,
        error: 'AUTH_ERROR'
    });
};

export const protect = async (req, res, next) => {
    let token;

    // Extract token from Authorization header or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return handleAuthError(res, 'Access denied. No token provided.', 401);
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return handleAuthError(res, 'User not found. Invalid token.', 401);
        }

        // Check if user is active/banned
        if (user.status === 'banned') {
            return handleAuthError(res, 'Account has been banned. Contact support.', 403);
        }

        // Maintenance Mode Check
        const settings = await Settings.findOne();
        if (settings && settings.maintenanceMode && user.role !== 'admin') {
            return res.status(503).json({
                success: false,
                message: 'System is currently under maintenance. Please try again later.',
                maintenance: true,
                error: 'MAINTENANCE_MODE'
            });
        }

        // Attach user to request object
        req.user = user;
        next();

    } catch (error) {
        console.error('[AuthMiddleware] Token verification failed:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return handleAuthError(res, 'Invalid token format.', 401);
        } else if (error.name === 'TokenExpiredError') {
            return handleAuthError(res, 'Token has expired. Please login again.', 401);
        } else if (error.name === 'NotBeforeError') {
            return handleAuthError(res, 'Token not active.', 401);
        }
        
        return handleAuthError(res, 'Authentication failed.', 401);
    }
};

export const protectOptional = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId).select('-password');
            
            if (user && user.status !== 'banned') {
                req.user = user;
            }
        } catch (error) {
            // Silently continue without user if token is invalid
            console.warn('[AuthMiddleware] Optional auth failed:', error.message);
        }
    }
    
    next();
};

// Role hierarchy for access control
const ROLE_HIERARCHY = {
    'student': 0,
    'instructor': 1,
    'admin': 2
};

// Check if user has required role or higher privilege
const hasRequiredRole = (userRole, requiredRoles) => {
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    
    // Check if user has any of the required roles or higher privilege
    for (const requiredRole of requiredRoles) {
        const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
        if (userLevel >= requiredLevel) {
            return true;
        }
    }
    
    return false;
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return handleAuthError(res, 'Authentication required.', 401);
        }

        console.log(`🔍 Authorization check: User role="${req.user.role}", Required roles=[${roles.join(', ')}]`);

        // Check if user has required role or higher privilege
        if (!hasRequiredRole(req.user.role, roles)) {
            const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
            const requiredLevels = roles.map(role => ROLE_HIERARCHY[role] || 0);
            const maxRequiredLevel = Math.max(...requiredLevels);
            
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role level: ${maxRequiredLevel} (${roles.join(' or ')}), Your role level: ${userLevel} (${req.user.role}).`,
                requiredRoles: roles,
                userRole: req.user.role,
                userLevel,
                requiredLevel: maxRequiredLevel,
                roleHierarchy: ROLE_HIERARCHY,
                error: 'INSUFFICIENT_PERMISSIONS'
            });
        }
        
        console.log(`✅ Authorization granted for user "${req.user.email}" with role "${req.user.role}"`);
        next();
    };
};

export const admin = (req, res, next) => {
    if (!req.user) {
        return handleAuthError(res, 'Authentication required.', 401);
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required.',
            error: 'ADMIN_REQUIRED'
        });
    }
    
    next();
};

// Additional middleware for specific role checks
export const instructorOnly = (req, res, next) => {
    if (!req.user) {
        return handleAuthError(res, 'Authentication required.', 401);
    }

    if (!['instructor', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Instructor access required.',
            error: 'INSTRUCTOR_REQUIRED'
        });
    }
    
    next();
};

export const studentOnly = (req, res, next) => {
    if (!req.user) {
        return handleAuthError(res, 'Authentication required.', 401);
    }

    if (req.user.role !== 'student') {
        return res.status(403).json({
            success: false,
            message: 'Student access required.',
            error: 'STUDENT_REQUIRED'
        });
    }
    
    next();
};
