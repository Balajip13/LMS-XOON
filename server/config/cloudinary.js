import { v2 as cloudinary } from 'cloudinary';

const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
const api_key = process.env.CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRET;

if (!cloud_name || !api_key || !api_secret) {
    console.warn('[Cloudinary] Not configured (missing env vars).');
} else {
    cloudinary.config({
        cloud_name,
        api_key,
        api_secret,
        secure: true
    });
    if (process.env.NODE_ENV === 'development') {
        console.log('[Cloudinary] Configured');
    }
}

export default cloudinary;
