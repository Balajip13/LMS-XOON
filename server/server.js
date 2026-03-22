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
import { generalLimiter, uploadLimiter, emailLimiter } from './middleware/rateLimiter.js';

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

// ✅ IMPORTANT FOR RENDER
app.set("trust proxy", 1);

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting (commented out for development speed)
// app.use(generalLimiter);

// ✅ FIXED CORS (PRODUCTION READY)
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // In development, allow all origins
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        
        // In production, allow specific origins
        const allowedOrigins = [
            process.env.CLIENT_URL,
            'https://your-vercel-domain.vercel.app',
            'http://localhost:5173',
            'http://localhost:3000'
        ].filter(Boolean);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// DB
connectDB();

// Static files
const __dirname = path.resolve();
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'XOON LMS API is healthy'
    });
});

// Routes
app.use('/api/users', userRoutes);
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

// Base API
app.get('/api', (req, res) => {
    res.json({ message: 'API running...' });
});

// Root
app.get('/', (req, res) => {
    res.json({ message: 'Server running...' });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});