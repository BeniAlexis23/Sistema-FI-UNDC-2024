import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_LOCAL);
        /*'mongodb://localhost:27017/merndb' */
        console.log('DB is connect')
    } catch (error) {
        console.log(error)
    }
};