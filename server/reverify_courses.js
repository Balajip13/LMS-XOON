import mongoose from 'mongoose';
import 'dotenv/config';

const courseSchema = new mongoose.Schema({
    title: String,
    isPublished: Boolean,
    status: String,
});

const Course = mongoose.model('CourseCheck', courseSchema, 'courses');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/xoon-lms');
        console.log('Connected to MongoDB');

        const courses = await Course.find({});
        console.log(`Total courses in "courses" collection: ${courses.length}`);

        const publicCourses = await Course.find({ isPublished: true, status: 'approved' });
        console.log(`Published & Approved courses: ${publicCourses.length}`);

        publicCourses.forEach(c => {
            console.log(`- ${c.title} (Published: ${c.isPublished}, Status: ${c.status})`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

check();
