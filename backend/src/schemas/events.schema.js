import { z } from 'zod';
import { dateSchema, httpUrlSchema, requireAtLeastOneField } from './common.schema.js';
import { managedImageUrlSchema } from './blocks.schema.js';

export const MAX_LINKED_NOTICES = 20;
export const MAX_SUMMARY_CHARS = 1500;

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid resource identifier');
const optionalText = (max, message) => z.string().trim().max(max, message).optional();
/* Una cadena vacía quita el valor guardado */
const clearable = (schema) => z.union([schema, z.literal('')]).optional();

export const eventSlugSchema = z.string().trim().toLowerCase()
    .min(2, 'The slug is too short').max(40, 'The slug is too long')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'The slug can only have lowercase letters, numbers and hyphens');

export const eventSlugParamsSchema = z.object({ slug: eventSlugSchema }).strict();

/* ---- Series ---- */

const seriesFields = {
    descripcion: optionalText(1000, 'Description is too long'),
    logo: clearable(managedImageUrlSchema),
    logoAlt: optionalText(200, 'Logo description is too long'),
    color: clearable(z.string().trim().regex(/^#[0-9a-f]{6}$/i, 'The color must look like #1081ea')),
    orden: z.number().int('Invalid order').min(0, 'Invalid order').max(999, 'Invalid order').optional(),
    activo: z.boolean().optional()
};

const nombreSchema = z.string().trim().min(1, 'The name is required').max(200, 'The name is too long');
const siglaSchema = z.string().trim().min(1, 'The acronym is required').max(20, 'The acronym is too long');

export const createSeriesSchema = z.object({
    slug: eventSlugSchema,
    nombre: nombreSchema,
    sigla: siglaSchema,
    urlPermanente: httpUrlSchema,
    ...seriesFields
}).strict();

export const updateSeriesSchema = requireAtLeastOneField(z.object({
    slug: eventSlugSchema.optional(),
    nombre: nombreSchema.optional(),
    sigla: siglaSchema.optional(),
    urlPermanente: httpUrlSchema.optional(),
    ...seriesFields
}).strict());

/* ---- Ediciones ---- */

const editionFields = {
    numeral: clearable(z.string().trim().toUpperCase().regex(/^[IVXLCDM]{1,15}$/, 'The numeral must be a Roman numeral')),
    titulo: optionalText(200, 'Title is too long'),
    semestre: clearable(z.string().trim().toUpperCase().regex(/^\d{4}-(?:0|I|II)$/, 'The semester must look like 2026-I or 2026-II')),
    fechaInicio: clearable(dateSchema),
    fechaFin: clearable(dateSchema),
    sede: optionalText(200, 'Venue is too long'),
    url: clearable(httpUrlSchema),
    portada: clearable(managedImageUrlSchema),
    portadaAlt: optionalText(200, 'Cover description is too long'),
    // texto plano: el controlador quita cualquier etiqueta antes de guardarlo
    resumen: z.string().max(MAX_SUMMARY_CHARS * 2, 'Summary is too long').optional(),
    destacada: z.boolean().optional(),
    hidden: z.boolean().optional(),
    noticias: z.array(objectIdSchema).max(MAX_LINKED_NOTICES, `At most ${MAX_LINKED_NOTICES} related notices`).optional()
};

const numeroSchema = z.number().int('The edition number must be a whole number').min(1, 'The edition number must be at least 1').max(999, 'The edition number is too large');

/* Aquí solo se comparan las fechas enviadas juntas; el controlador revisa la edición ya combinada */
const checkDates = (data, context) => {
    if (data.fechaInicio && data.fechaFin && new Date(data.fechaFin) < new Date(data.fechaInicio)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: 'The end cannot be before the start', path: ['fechaFin'] });
    }
};

export const createEditionSchema = z.object({
    serie: objectIdSchema,
    numero: numeroSchema,
    ...editionFields
}).strict().superRefine(checkDates);

export const updateEditionSchema = requireAtLeastOneField(z.object({
    serie: objectIdSchema.optional(),
    numero: numeroSchema.optional(),
    ...editionFields
}).strict()).superRefine(checkDates);

export const editionsQuerySchema = z.object({
    serie: objectIdSchema.optional()
}).strict();

export const editionDestacadaSchema = z.object({
    destacada: z.boolean().optional()
}).strict();

export const editionVisibilitySchema = z.object({
    hidden: z.boolean()
}).strict();
