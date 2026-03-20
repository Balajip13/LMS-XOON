import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/xoonlms';

mongoose.connect(MONGO_URI).then(async () => {
    const user = await User.findOne({ email: 'manik@gmail.com' });
    console.log('USER_CHECK:', JSON.stringify(user, null, 2));
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
