import { z } from 'zod';
import { dateSchema, descriptionSchema, requireAtLeastOneField, titleSchema } from './common.schema.js';

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid resource identifier');

const booleanField = z.preprocess((value) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
}, z.boolean({ invalid_type_error: 'Invalid boolean value' }));

/* En multipart todo llega como texto; una cadena vacía limpia el valor guardado */
const noticeOptionalFields = {
    hidden: booleanField.optional(),
    featured: booleanField.optional(),
    publishAt: z.union([dateSchema, z.literal('')]).optional(),
    category: z.union([objectIdSchema, z.literal('')]).optional(),
    byline: z.string().trim().max(80, 'Byline is too long').optional(),
    imageAlt: z.string().trim().max(200, 'Image description is too long').optional()
};

export const createNoticeSchema = z.object({
    title: titleSchema,
    description: descriptionSchema,
    date: dateSchema.optional(),
    ...noticeOptionalFields
}).strict();

/* baseUpdatedAt: el `updatedAt` que vio el editor; si cambió, otro usuario guardó antes */
export const updateNoticeSchema = requireAtLeastOneField(z.object({
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    date: dateSchema.optional(),
    baseUpdatedAt: dateSchema.optional(),
    ...noticeOptionalFields
}).strict());

export const noticeVisibilitySchema = requireAtLeastOneField(z.object({
    hidden: z.boolean().optional(),
    featured: z.boolean().optional()
}).strict());

/* Sin parámetros se conserva el comportamiento anterior (orden de inserción, sin tope);
   cualquiera de estos activa el orden por fecha */
export const publicNoticesQuerySchema = z.object({
    limit: z.coerce.number().int().min(1, 'Invalid limit').max(50, 'Invalid limit').optional(),
    category: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{1,60}$/, 'Invalid category').optional(),
    featuredFirst: z.enum(['1', 'true']).optional(),
    sort: z.enum(['date_desc']).optional()
});

const dayParam = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date');
const validDate = (value) => !Number.isNaN(value.getTime());
const startOfDay = dayParam.transform((value) => new Date(`${value}T00:00:00.000Z`)).refine(validDate, 'Invalid date');
const endOfDay = dayParam.transform((value) => new Date(`${value}T23:59:59.999Z`)).refine(validDate, 'Invalid date');

/* Sin parámetros el panel recibe el arreglo completo de antes; con cualquiera, la página `{ items, total }` */
export const adminNoticesQuerySchema = z.object({
    q: z.string().trim().max(100, 'Search text is too long').optional(),
    status: z.enum(['published', 'hidden', 'scheduled']).optional(),
    category: z.union([z.literal('none'), objectIdSchema]).optional(),
    featured: z.enum(['1', 'true']).optional(),
    from: startOfDay.optional(),
    to: endOfDay.optional(),
    sort: z.enum(['date_desc', 'date_asc', 'title_asc']).optional(),
    page: z.coerce.number().int().min(1, 'Invalid page').optional(),
    limit: z.coerce.number().int().min(1, 'Invalid limit').max(50, 'Invalid limit').optional()
});
