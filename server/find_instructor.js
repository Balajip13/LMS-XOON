import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const findInstructor = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const instructor = await User.findOne({ role: 'instructor' });
        if (instructor) {
            console.log(`INSTRUCTOR_EMAIL: ${instructor.email}`);
            console.log(`INSTRUCTOR_NAME: ${instructor.name}`);
        } else {
            console.log("NO_INSTRUCTOR_FOUND");
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

findInstructor();
