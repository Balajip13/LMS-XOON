import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        const isProduction = process.env.NODE_ENV === 'production';
        
        console.log(`[DB] Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`[DB] MONGO_URI provided: ${!!mongoUri}`);

        if (!mongoUri) {
            throw new Error('MONGO_URI environment variable is not defined.');
        }

        if (isProduction && (mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1'))) {
            throw new Error('Render production environment requires a hosted MongoDB connection string (e.g., MongoDB Atlas), not a localhost URL.');
        }

        // Optimized connection options for faster startup
        const conn = await mongoose.connect(mongoUri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferCommands: false
        });

        console.log(`[DB] MongoDB Connected Host: ${conn.connection.host}`);
        console.log(`[DB] Database Name: ${conn.connection.name}`);
        
    } catch (error) {
        const errorMsg = (error.message || '').toLowerCase();
        
        if (errorMsg.includes('bad auth') || errorMsg.includes('authentication failed')) {
            throw new Error(`Authentication failed (bad auth). Please check the username and password in MONGO_URI in Render. Details: ${error.message}`);
        } else if (errorMsg.includes('timeout') || errorMsg.includes('enotfound') || errorMsg.includes('econnrefused') || error.name === 'MongoServerSelectionError') {
            throw new Error(`Network or cluster access failure. Ensure your Render IP is whitelisted in MongoDB Atlas (or use 0.0.0.0/0). Details: ${error.message}`);
        } else if (error.name === 'MongoParseError') {
            throw new Error(`Invalid MongoDB URI format. Please check the MONGO_URI value. Details: ${error.message}`);
        }
        
        throw new Error(`Error connecting to MongoDB: ${error.message}`);
    }
};

export default connectDB;
