import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const testAuth = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB Connected");

        const email = 'admin@xoon.com';
        const password = 'admin@xoon321';

        const user = await User.findOne({ email });
        if (!user) {
            console.log("USER_NOT_FOUND");
            process.exit(1);
        }

        console.log("User Found. Role:", user.role);

        const isMatch = await user.matchPassword(password);
        console.log("Password Match:", isMatch);

        if (isMatch) {
            console.log("AUTH_SUCCESS");
        } else {
            console.log("AUTH_FAILED");
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

testAuth();
