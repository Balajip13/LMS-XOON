import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const dropIndexes = async (collection) => {
    try {
        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes.map(idx => idx.name));

        // We want to drop any unique index on 'user' or 'userId' that might be stale
        // or any that include null values.
        for (const idx of indexes) {
            if (idx.name !== '_id_') {
                console.log(`Dropping index: ${idx.name}`);
                await collection.dropIndex(idx.name);
            }
        }
    } catch (err) {
        console.warn('Error dropping indexes:', err.message);
    }
};

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for final migration...');

        const collection = mongoose.connection.collection('instructorapplications');

        // 1. Drop all existing indexes to clear duplicate key errors on null values
        await dropIndexes(collection);

        // 2. Perform field renames
        const result = await collection.updateMany({}, {
            $rename: {
                "user": "userId",
                "bio": "biography",
                "courseCategory": "category",
                "teachReason": "reason",
                "adminNotes": "rejectionReason"
            }
        });

        console.log(`Migration complete. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

        // 3. Cleanup userId: null
        const cleanup = await collection.deleteMany({ userId: null });
        console.log(`Cleanup: Deleted ${cleanup.deletedCount} items with null userId.`);

        // 4. Mongoose will recreate the correct unique index on next launch,
        // but let's ensure it's clean for now.

        console.log('Migration successfully completed.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
