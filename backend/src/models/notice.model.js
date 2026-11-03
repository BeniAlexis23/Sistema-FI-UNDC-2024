import mongoose from 'mongoose';

/* `content` y `mediaRefs` no tienen valor por defecto: los documentos legados no deben hidratarse con [] */
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
    content: { type: [mongoose.Schema.Types.Mixed], default: undefined },
    mediaRefs: { type: [String], default: undefined },
    readingMinutes: { type: Number, min: 1 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
},
    {
        timestamps: true
    });

noticeSchema.index({ date: -1, _id: -1 });
noticeSchema.index({ category: 1, date: -1 });
noticeSchema.index({ user: 1, date: -1 });
noticeSchema.index({ mediaRefs: 1 });

export default mongoose.model('Notice', noticeSchema);
