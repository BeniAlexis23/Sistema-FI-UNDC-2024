import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 40, unique: true },
    slug: { type: String, required: true, trim: true, lowercase: true, maxlength: 60, unique: true },
    order: { type: Number, default: 0 }
},
    {
        timestamps: true
    });

export default mongoose.model('Category', categorySchema);
