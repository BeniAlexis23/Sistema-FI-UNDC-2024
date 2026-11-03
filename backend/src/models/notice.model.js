import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 50000 },
    imageUrl: { type: String },
    imageAlt: { type: String, trim: true, maxlength: 200 },
    date: { type: Date, default: Date.now },
    hidden: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    publishAt: { type: Date },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    byline: { type: String, trim: true, maxlength: 80 },
    content: { type: [mongoose.Schema.Types.Mixed], default: [] },
    readingMinutes: { type: Number, min: 1 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
},
    {
        timestamps: true
    });

noticeSchema.index({ hidden: 1, publishAt: 1, date: -1 });
noticeSchema.index({ user: 1, date: -1 });
noticeSchema.index({ category: 1, date: -1 });

export default mongoose.model('Notice', noticeSchema);
