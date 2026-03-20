import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.js';

dotenv.config();

const checkCourses = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/xlms');
        console.log('Connected to DB');

        const courses = await Course.find();
        console.log(`Found ${courses.length} courses`);

        courses.forEach(c => {
            console.log(`- ${c.title}: status=${c.status}, isPublished=${c.isPublished}`);
        });

        const approved = courses.filter(c => c.status === 'approved' && c.isPublished);
        console.log(`Approved & Published: ${approved.length}`);

        if (approved.length === 0 && courses.length > 0) {
            console.log('Updating first course to approved/published for testing...');
            courses[0].status = 'approved';
            courses[0].isPublished = true;
            await courses[0].save();
            console.log('Updated:', courses[0].title);
        }

        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkCourses();
