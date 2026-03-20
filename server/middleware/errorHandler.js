// Centralized Error Handling Middleware
export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    const logPayload = {
        message: err.message,
        user: req.user?._id || 'anonymous',
        ip: req.ip
    };
    if (process.env.NODE_ENV === 'development') {
        logPayload.stack = err.stack;
    }
    console.error(`[Error] ${req.method} ${req.path}:`, logPayload);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { message, statusCode: 404 };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field} already exists`;
        error = { message, statusCode: 400 };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = { message, statusCode: 400 };
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = { message, statusCode: 401 };
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = { message, statusCode: 401 };
    }

    // Multer file upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        const message = 'File size too large';
        error = { message, statusCode: 400 };
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
        const message = 'Too many files';
        error = { message, statusCode: 400 };
    }

    // Default error response
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error',
        error: error.name || 'INTERNAL_SERVER_ERROR',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// Async error wrapper
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler
export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};
