import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.js';

dotenv.config();

const seedSettings = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/xlms');

        // Remove existing if any
        await Settings.deleteMany({});

        // Create Default settings
        const settings = await Settings.create({
            platformName: 'XOON LMS MOCK SETUP',
            smtpConfig: {
                host: 'sandbox.smtp.mailtrap.io', // standard mailtrap testing host
                port: 2525,
                secure: false,
                user: 'fakeuser123',
                pass: 'fakepass123'
            }
        });

        console.log('--- DEFAULT DB SETTINGS INSERTED ---');
        console.log(settings);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedSettings();
