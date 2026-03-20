import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'xoon_lms/profile_images',
        resource_type: 'image',
        public_id: (req, file) => `profile-${req.user._id}-${Date.now()}`,
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Images only!'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
});

export default upload;
