import mongoose from 'mongoose';

const rcfSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 50000 },
    url: { type: String, required: true, maxlength: 2048 },
    date: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
},
    {
        timestamps: true
    });

export default mongoose.model('Rcf', rcfSchema);
