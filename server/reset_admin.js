import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const resetAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await User.findOne({ email: 'admin@xoon.com' });

        if (admin) {
            console.log("Found Admin.");
            admin.password = '123456';
            await admin.save();
            console.log("Password updated.");

            // Verification
            const updatedAdmin = await User.findOne({ email: 'admin@xoon.com' });
            console.log("Hashed Password:", updatedAdmin.password);

            const isMatch = await updatedAdmin.matchPassword('123456');
            console.log("Self-Verification Match:", isMatch);
        } else {
            console.log("Admin user not found");
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

resetAdmin();
