import mongoose from 'mongoose';

/* Diapositiva de la portada. Se muestra si está activa y dentro de su ventana de fechas (startAt / endAt).
   El botón enlaza a una dirección web (ctaUrl) o a una noticia del portal (notice), nunca a ambas. */
const heroSlideSchema = new mongoose.Schema({
    image: { type: String, required: true },
    imageMobile: { type: String },
    alt: { type: String, trim: true, maxlength: 200 },
    title: { type: String, trim: true, maxlength: 100 },
    subtitle: { type: String, trim: true, maxlength: 200 },
    ctaLabel: { type: String, trim: true, maxlength: 40 },
    ctaUrl: { type: String, trim: true, maxlength: 2048 },
    notice: { type: mongoose.Schema.Types.ObjectId, ref: 'Notice' },
    focusX: { type: Number, min: 0, max: 100, default: 50 },
    focusY: { type: Number, min: 0, max: 100, default: 50 },
    active: { type: Boolean, default: true },
    startAt: { type: Date },
    endAt: { type: Date },
    order: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},
    {
        timestamps: true
    });

heroSlideSchema.index({ order: 1, createdAt: 1 });

export default mongoose.model('HeroSlide', heroSlideSchema);
