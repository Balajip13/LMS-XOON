import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import path from 'path';
import fs from 'fs';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { generalLimiter, authLimiter, uploadLimiter, emailLimiter } from './middleware/rateLimiter.js';
import userRoutes from './routes/userRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import chapterRoutes from './routes/chapterRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import instructorRoutes from './routes/instructorRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import payoutRoutes from './routes/payoutRoutes.js';
import supportTicketRoutes from './routes/supportTicketRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const app = express();

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Apply general rate limiting to all requests
app.use(generalLimiter);

// CORS Configuration
const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Database Connection
connectDB();

// Static files
const __dirname = path.resolve();
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'XOON LMS API is healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// API Routes with specific rate limiters
app.use('/api/users', userRoutes); // Temporarily removed authLimiter for testing
app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/contact', emailLimiter, contactRoutes);
app.use('/api/newsletter', emailLimiter, newsletterRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/tickets', supportTicketRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/upload', uploadLimiter, uploadRoutes);

// Base API endpoint
app.get('/api', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'XOON LMS API Base is running...',
        version: '1.0.0'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'XOON LMS API is running...',
        documentation: '/api'
    });
});

// 404 Handler
app.use(notFound);

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔒 Rate limiting enabled`);
});
