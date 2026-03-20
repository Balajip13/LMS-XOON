import mongoose from 'mongoose';
import Course from './server/models/Course.js';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const checkCourses = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const courses = await Course.find({});
        console.log(`Found ${courses.length} courses in total.`);

        courses.forEach(c => {
            console.log(`- Title: ${c.title}, Published: ${c.isPublished}, Status: ${c.status}, ID: ${c._id}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkCourses();
