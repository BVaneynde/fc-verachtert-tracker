import mongoose from 'mongoose';

export async function connectDatabase(): Promise<void> {
    try {
        const mongoUri = process.env.MONGODB_URI;
        
        if (!mongoUri) {
            console.warn('MONGODB_URI not found in environment variables. Using JSON files as fallback.');
            return;
        }

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        console.log('Falling back to JSON file storage');
    }
}

export function isDatabaseConnected(): boolean {
    return mongoose.connection.readyState === 1;
}
