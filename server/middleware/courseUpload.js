import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folder = 'xoon_lms/others';
        let resource_type = 'auto';

        if (file.fieldname === 'thumbnail') {
            folder = 'xoon_lms/thumbnails';
            resource_type = 'image';
        } else if (file.fieldname === 'video') {
            folder = 'xoon_lms/videos';
            resource_type = 'video';
        }

        return {
            folder: folder,
            resource_type: resource_type,
            public_id: file.fieldname + '-' + Date.now(),
        };
    },
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
    limits: { fileSize: 100 * 1024 * 1024 } // 100 MB for videos
});

export default courseUpload;
