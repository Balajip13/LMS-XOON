import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await User.findOne({ role: 'admin' });
        if (admin) {
            console.log(`ADMIN_EMAIL: ${admin.email}`);
            console.log(`ADMIN_NAME: ${admin.name}`);
        } else {
            console.log("NO_ADMIN_FOUND");
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUsers();
