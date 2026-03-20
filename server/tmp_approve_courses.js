import mongoose from 'mongoose';
import Course from '../server/models/Course.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/xoon_lms';

async function approveCourses() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Approve and publish all existing courses for verification
        const result = await Course.updateMany(
            {},
            {
                $set: {
                    status: 'approved',
                    isPublished: true
                }
            }
        );

        console.log(`Updated ${result.modifiedCount} courses to approved/published.`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

approveCourses();
