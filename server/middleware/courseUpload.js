import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure temp upload directory exists
const tempDir = 'uploads/temp';
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Please upload an image'), false);
        }
    } else if (file.fieldname === 'video') {
        if (!file.mimetype.startsWith('video/')) {
            return cb(new Error('Please upload a video'), false);
        }
    }
    cb(null, true);
};

const courseUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // 100 MB
});

export const courseUploadFields = courseUpload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]);

export default courseUpload;
