import multer from 'multer';

const MAX_BYTES = 5 * 1024 * 1024;

const allowedMime = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const fileFilter = (req, file, cb) => {
    if (allowedMime.has(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, DOC, or DOCX files are allowed'), false);
    }
};

const resumeUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_BYTES },
    fileFilter,
});

export default resumeUpload;
