import fs from 'fs';
import path from 'path';

const files = [
    './config/db.js',
    './routes/userRoutes.js',
    './routes/courseRoutes.js',
    './routes/adminRoutes.js',
    './routes/paymentRoutes.js',
    './routes/certificateRoutes.js',
    './routes/contactRoutes.js',
    './routes/chapterRoutes.js',
    './routes/reviewRoutes.js',
    './routes/settingsRoutes.js',
    './routes/enrollmentRoutes.js',
    './routes/announcementRoutes.js',
    './routes/instructorRoutes.js',
    './routes/categoryRoutes.js',
    './routes/supportTicketRoutes.js',
    './routes/payoutRoutes.js',
];

files.forEach(f => {
    const fullPath = path.resolve('c:/Users/manik/OneDrive/Desktop/xlms/server', f);
    if (!fs.existsSync(fullPath)) {
        console.log(`MISSING: ${f} (${fullPath})`);
    } else {
        console.log(`EXISTS: ${f}`);
    }
});
