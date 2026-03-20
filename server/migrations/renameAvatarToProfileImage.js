import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const migrateAvatarToProfileImage = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const users = db.collection('users');

        // Update all users: rename 'avatar' field to 'profileImage'
        const result = await users.updateMany(
            { avatar: { $exists: true } },
            { $rename: { avatar: 'profileImage' } }
        );

        console.log(`Migration completed. Modified ${result.modifiedCount} documents.`);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
};

migrateAvatarToProfileImage();
