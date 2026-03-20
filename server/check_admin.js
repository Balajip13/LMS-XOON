import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const checkAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/xlms');
        console.log('Connected to DB');

        const adminEmail = 'admin@xoon.com';
        const adminPass = 'admin@xoon321';

        let admin = await User.findOne({ email: adminEmail });

        if (!admin) {
            console.log('Admin user not found. Creating one...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPass, salt);

            admin = await User.create({
                name: 'Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                isVerified: true
            });
            console.log('Admin user created successfully');
        } else {
            console.log('Admin user found:', admin.email);
            console.log('Role:', admin.role);

            const isMatch = await bcrypt.compare(adminPass, admin.password);
            console.log('Password Match:', isMatch);

            if (!isMatch || admin.role !== 'admin') {
                console.log('Correcting admin user...');
                const salt = await bcrypt.genSalt(10);
                admin.password = await bcrypt.hash(adminPass, salt);
                admin.role = 'admin';
                await admin.save();
                console.log('Admin user updated successfully');
            }
        }

        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkAdmin();
