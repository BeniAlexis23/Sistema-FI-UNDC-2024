import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["admin", "editor"],
        default: "editor",
        required: true
    },
    active: { type: Boolean, default: true, required: true },
    passwordChangeRequired: { type: Boolean, default: false, required: true }
}, {
    timestamps: true
});

export default mongoose.model("User", userSchema);
