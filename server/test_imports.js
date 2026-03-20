const modules = [
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
    './routes/payoutRoutes.js'
];

async function testImports() {
    for (const mod of modules) {
        try {
            await import(mod);
            console.log(`OK: ${mod}`);
        } catch (err) {
            console.error(`FAIL: ${mod}`);
            console.error(err);
            // break; // Optionally break on first fail
        }
    }
}

testImports();
