import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const testPasswordFlow = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔗 Connected to MongoDB');

        const testEmail = 'test@password.com';
        const testPassword = 'Test@123';

        // Clean up any existing test user
        await User.deleteOne({ email: testEmail });

        // Step 1: Create a new user
        console.log('\n📝 Creating test user...');
        const user = new User({
            name: 'Password Test User',
            email: testEmail,
            password: testPassword
        });

        await user.save();
        console.log('✅ User created successfully');
        console.log('🔐 Stored password hash length:', user.password.length);

        // Step 2: Test password comparison
        console.log('\n🔍 Testing password comparison...');
        const isMatch = await user.matchPassword(testPassword);
        console.log('🔍 Password match result:', isMatch);

        // Step 3: Test wrong password
        console.log('\n❌ Testing wrong password...');
        const isWrongMatch = await user.matchPassword('WrongPassword');
        console.log('🔍 Wrong password match result:', isWrongMatch);

        // Step 4: Find user and test login flow
        console.log('\n🔍 Testing login flow...');
        const foundUser = await User.findOne({ email: testEmail }).select('+password');
        console.log('✅ User found:', foundUser.email);
        console.log('🔐 Has password field:', !!foundUser.password);

        const loginMatch = await foundUser.matchPassword(testPassword);
        console.log('🔍 Login password match:', loginMatch);

        // Clean up
        await User.deleteOne({ email: testEmail });
        console.log('\n🧹 Test user cleaned up');

        process.exit(0);
    } catch (error) {
        console.error('💥 Test failed:', error);
        process.exit(1);
    }
};

testPasswordFlow();
