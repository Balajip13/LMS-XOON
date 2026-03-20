import mongoose from 'mongoose';
import dotenv from 'dotenv';
import sendWelcomeEmail from './utils/sendEmail.js';

dotenv.config();

const testEmail = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/xlms');
        console.log('Connected to DB');

        await sendWelcomeEmail('test_debug@xoon.com', 'Debug User');

        console.log('Finished execution.');
        process.exit(0);
    } catch (error) {
        console.error('Fatal Script Error:', error);
        process.exit(1);
    }
};

testEmail();
