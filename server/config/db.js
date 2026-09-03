import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        
        if (!mongoUri) {
            throw new Error('MONGO_URI environment variable is not defined');
        }

        // Optimized connection options for faster startup
        const conn = await mongoose.connect(mongoUri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferCommands: false
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
    } catch (error) {
        throw new Error(`Error connecting to MongoDB: ${error.message}`);
    }
};

export default connectDB;
