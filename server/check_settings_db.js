import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.js';

dotenv.config();

const checkSettings = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/xlms');

        const settings = await Settings.findOne();
        console.log('--- DB SETTINGS ---');
        console.log(JSON.stringify(settings, null, 2));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkSettings();
