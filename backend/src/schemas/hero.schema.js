import { z } from 'zod';
import { dateSchema, requireAtLeastOneField } from './common.schema.js';
import { managedImageUrlSchema, safeLinkUrlSchema } from './blocks.schema.js';

export const MAX_SLIDES = 20;

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid resource identifier');
const optionalText = (max, message) => z.string().trim().max(max, message).optional();

/* Una cadena vacía quita el valor guardado (imagen móvil, enlace, noticia o fechas) */
const slideFields = {
    imageMobile: z.union([managedImageUrlSchema, z.literal('')]).optional(),
    alt: optionalText(200, 'Image description is too long'),
    title: optionalText(100, 'Title is too long'),
    subtitle: optionalText(200, 'Subtitle is too long'),
    ctaLabel: optionalText(40, 'Button text is too long'),
    ctaUrl: z.union([safeLinkUrlSchema, z.literal('')]).optional(),
    notice: z.union([objectIdSchema, z.literal('')]).optional(),
    focusX: z.number().min(0, 'Invalid focus').max(100, 'Invalid focus').optional(),
    focusY: z.number().min(0, 'Invalid focus').max(100, 'Invalid focus').optional(),
    active: z.boolean().optional(),
    startAt: z.union([dateSchema, z.literal('')]).optional(),
    endAt: z.union([dateSchema, z.literal('')]).optional()
};

const checkRules = (data, context) => {
    if (data.ctaUrl && data.notice) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: 'Choose a web address or a notice for the button, not both', path: ['ctaUrl'] });
    }
    if (data.startAt && data.endAt && new Date(data.endAt) <= new Date(data.startAt)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: 'The end must be after the start', path: ['endAt'] });
    }
};

export const createSlideSchema = z.object({ image: managedImageUrlSchema, ...slideFields }).strict().superRefine(checkRules);

export const updateSlideSchema = requireAtLeastOneField(
    z.object({ image: managedImageUrlSchema.optional(), ...slideFields }).strict()
).superRefine(checkRules);

export const reorderSlidesSchema = z.object({
    ids: z.array(objectIdSchema).min(1, 'The list is empty').max(MAX_SLIDES, 'Too many slides')
}).strict();

export const heroSettingsSchema = requireAtLeastOneField(z.object({
    includeFeatured: z.boolean().optional(),
    intervalSeconds: z.number().int().min(3, 'Interval must be between 3 and 20 seconds').max(20, 'Interval must be between 3 and 20 seconds').optional()
}).strict());
