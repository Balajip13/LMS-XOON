import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const resetAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const adminEmail = 'admin@xoon.com';
        const newPassword = 'admin@xoon321';

        let admin = await User.findOne({ email: adminEmail });

        if (!admin) {
            console.log("Admin not found, creating one...");
            admin = new User({
                name: 'Admin',
                email: adminEmail,
                password: newPassword,
                role: 'admin'
            });
        } else {
            console.log("Found Admin. Role:", admin.role);
            admin.role = 'admin'; // Ensure it's exactly 'admin'
            admin.password = newPassword;
        }

        await admin.save();
        console.log(`Admin password set to '${newPassword}' and role confirmed as 'admin'.`);

        // Final check
        const finalAdmin = await User.findOne({ email: adminEmail });
        const isMatch = await finalAdmin.matchPassword(newPassword);
        console.log("Password Verify Check:", isMatch ? "SUCCESS" : "FAILED");
        console.log("Final Role in DB:", finalAdmin.role);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

resetAdmin();
