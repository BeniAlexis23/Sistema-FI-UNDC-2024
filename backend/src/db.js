import mongoose from 'mongoose';
import { DATABASE_URI } from './config.js';

export const connectDB = async () => {
    await mongoose.connect(DATABASE_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('MongoDB connection established');
};

export const disconnectDB = () => mongoose.disconnect();
