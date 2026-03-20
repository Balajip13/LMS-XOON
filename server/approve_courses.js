import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    status: { type: String, default: 'pending' },
    category: mongoose.Schema.Types.Mixed,
    instructor: mongoose.Schema.Types.Mixed
}, { strict: false });

const Course = mongoose.model('Course', courseSchema);

async function approveCourses() {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/xlms';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const courses = await Course.find({});
        console.log(`Found ${courses.length} total courses`);

        const result = await Course.updateMany({}, { $set: { status: 'approved' } });
        console.log(`Successfully approved ${result.modifiedCount} courses`);

        const approvedCount = await Course.countDocuments({ status: 'approved' });
        console.log(`Current approved count: ${approvedCount}`);

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err?.message);
        process.exit(1);
    }
}

approveCourses();
