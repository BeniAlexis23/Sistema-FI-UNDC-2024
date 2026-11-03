import mongoose from 'mongoose';

/* Ajustes sueltos del sitio, uno por clave (por ahora solo 'hero') */
const siteSettingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true, trim: true, maxlength: 60 },
    value: { type: mongoose.Schema.Types.Mixed, default: {} }
},
    {
        timestamps: true
    });

export default mongoose.model('SiteSetting', siteSettingSchema);
