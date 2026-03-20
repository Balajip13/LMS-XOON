import mongoose from 'mongoose';
import Course from '../server/models/Course.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/xoon_lms';

async function checkCourses() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const courses = await Course.find({});
        console.log('Total courses in DB:', courses.length);

        courses.forEach(c => {
            console.log(`- Title: ${c.title}, Published: ${c.isPublished}, Status: ${c.status}`);
        });

        const homepageQuery = { isPublished: true, status: 'approved' };
        const homepageCourses = await Course.find(homepageQuery);
        console.log('\nCourses that would show on homepage (guest):', homepageCourses.length);
        homepageCourses.forEach(c => {
            console.log(`  - ${c.title}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkCourses();
