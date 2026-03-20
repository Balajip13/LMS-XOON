import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const cleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for cleanup...');

        const collection = mongoose.connection.collection('instructorapplications');

        // 1. Remove all records where userId is null or missing
        const deleteNull = await collection.deleteMany({ userId: { $exists: false } });
        const deleteNullVal = await collection.deleteMany({ userId: null });

        console.log(`Deleted ${deleteNull.deletedCount + deleteNullVal.deletedCount} items with missing/null userId.`);

        // 2. Check for duplicate userIds and keep only the latest one
        const apps = await collection.find().sort({ createdAt: -1 }).toArray();
        const seenUsers = new Set();
        const toDelete = [];

        for (const app of apps) {
            const uid = app.userId?.toString();
            if (uid && seenUsers.has(uid)) {
                toDelete.push(app._id);
            } else if (uid) {
                seenUsers.add(uid);
            }
        }

        if (toDelete.length > 0) {
            const deleteDupe = await collection.deleteMany({ _id: { $in: toDelete } });
            console.log(`Deleted ${deleteDupe.deletedCount} duplicate application records.`);
        }

        console.log('Database integrity cleanup complete.');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
};

cleanup();
