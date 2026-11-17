import mongoose from 'mongoose';

/* Serie de eventos que se repite cada cierto tiempo (CIISIC, JEPA, FEINFO).
   `urlPermanente` es la dirección fija que siempre muestra la edición vigente; cada edición guarda además la suya. */
const eventSeriesSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 40, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
    nombre: { type: String, required: true, trim: true, maxlength: 200 },
    sigla: { type: String, required: true, trim: true, maxlength: 20 },
    descripcion: { type: String, trim: true, maxlength: 1000 },
    urlPermanente: { type: String, required: true, trim: true, maxlength: 2048 },
    logo: { type: String },
    logoAlt: { type: String, trim: true, maxlength: 200 },
    color: { type: String, trim: true, match: /^#[0-9a-f]{6}$/i },
    orden: { type: Number, default: 0 },
    activo: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},
    {
        timestamps: true
    });

eventSeriesSchema.index({ activo: 1, orden: 1 });
eventSeriesSchema.index({ logo: 1 }, { sparse: true });

// nombre de colección fijo: scripts/gc-uploads.js lo lee directamente
export default mongoose.model('EventSeries', eventSeriesSchema, 'eventseries');
