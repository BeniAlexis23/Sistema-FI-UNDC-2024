import mongoose from 'mongoose';

/* Una edición de una serie de eventos (p. ej. la VIII JEPA). `destacada` marca la edición vigente que enlaza el menú:
   a lo más una por serie (lo asegura el índice parcial único). */
const eventEditionSchema = new mongoose.Schema({
    serie: { type: mongoose.Schema.Types.ObjectId, ref: 'EventSeries', required: true },
    numero: { type: Number, required: true, min: 1, max: 999, validate: Number.isInteger },
    numeral: { type: String, required: true, trim: true, maxlength: 20 },
    titulo: { type: String, trim: true, maxlength: 200 },
    semestre: { type: String, trim: true, maxlength: 10 },
    fechaInicio: { type: Date },
    fechaFin: { type: Date },
    sede: { type: String, trim: true, maxlength: 200 },
    url: { type: String, trim: true, maxlength: 2048 },
    portada: { type: String },
    portadaAlt: { type: String, trim: true, maxlength: 200 },
    resumen: { type: String, trim: true, maxlength: 1500 },
    destacada: { type: Boolean, default: false },
    hidden: { type: Boolean, default: false },
    noticias: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notice' }], default: undefined },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},
    {
        timestamps: true
    });

eventEditionSchema.index({ serie: 1, numero: 1 }, { unique: true });
eventEditionSchema.index({ serie: 1 }, { unique: true, partialFilterExpression: { destacada: true }, name: 'one_destacada_per_serie' });
eventEditionSchema.index({ portada: 1 }, { sparse: true });

// nombre de colección fijo: scripts/gc-uploads.js lo lee directamente
export default mongoose.model('EventEdition', eventEditionSchema, 'eventeditions');
