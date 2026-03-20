import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const testAdminLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔗 Connected to MongoDB');

        const adminEmail = 'admin@xoon.com';
        const adminPassword = 'admin@xoon321';

        // Step 1: Find admin user
        console.log('\n🔍 Finding admin user...');
        const admin = await User.findOne({ email: adminEmail }).select('+password');
        
        if (!admin) {
            console.log('❌ Admin user not found');
            process.exit(1);
        }

        console.log('✅ Admin user found:', admin.email);
        console.log('🔐 Has password field:', !!admin.password);
        console.log('🔐 Password hash length:', admin.password?.length);
        console.log('👤 User role:', admin.role);
        console.log('🚫 Is blocked:', admin.isBlocked);
        console.log('📊 Status:', admin.status);

        // Step 2: Test password comparison
        console.log('\n🔍 Testing admin password comparison...');
        const isMatch = await admin.matchPassword(adminPassword);
        console.log('🔍 Password match result:', isMatch);

        if (isMatch) {
            console.log('✅ Admin login should work!');
        } else {
            console.log('❌ Admin password comparison failed');
            
            // Let's reset the admin password
            console.log('\n🔄 Resetting admin password...');
            admin.password = adminPassword;
            await admin.save();
            console.log('✅ Admin password reset');
            
            // Test again
            const resetMatch = await admin.matchPassword(adminPassword);
            console.log('🔍 Password match after reset:', resetMatch);
        }

        process.exit(0);
    } catch (error) {
        console.error('💥 Test failed:', error);
        process.exit(1);
    }
};

testAdminLogin();
