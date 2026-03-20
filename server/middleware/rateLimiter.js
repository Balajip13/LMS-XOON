import rateLimit from 'express-rate-limit';

// General rate limiter for all requests
export const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        error: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many requests from this IP, please try again later.',
            error: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.round((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
        });
    }
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.',
        error: 'AUTH_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many authentication attempts, please try again later.',
            error: 'AUTH_RATE_LIMIT_EXCEEDED',
            retryAfter: 900 // 15 minutes
        });
    }
});

// Rate limiter for file uploads
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 uploads per hour
    message: {
        success: false,
        message: 'Too many upload attempts, please try again later.',
        error: 'UPLOAD_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many upload attempts, please try again later.',
            error: 'UPLOAD_RATE_LIMIT_EXCEEDED',
            retryAfter: 3600 // 1 hour
        });
    }
});

// Rate limiter for email-related endpoints
export const emailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: parseInt(process.env.EMAIL_RATE_LIMIT) || 5, // limit each IP to 5 emails per hour
    message: {
        success: false,
        message: 'Too many email requests, please try again later.',
        error: 'EMAIL_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many email requests, please try again later.',
            error: 'EMAIL_RATE_LIMIT_EXCEEDED',
            retryAfter: 3600 // 1 hour
        });
    }
});

export default {
    generalLimiter,
    authLimiter,
    uploadLimiter,
    emailLimiter
};
