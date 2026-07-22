import { z } from 'zod';

export const titleSchema = z.string().trim().min(1, 'Title is required').max(200, 'Title is too long');
export const descriptionSchema = z.string().trim().min(1, 'Description is required').max(50000, 'Description is too long');
export const dateSchema = z.string().datetime({ offset: true, message: 'Invalid date format' });
export const httpUrlSchema = z.string().trim().url('Invalid URL format').max(2048).refine(
    (value) => {
        try {
            return ['http:', 'https:'].includes(new URL(value).protocol);
        } catch {
            return false;
        }
    },
    'URL must use HTTP or HTTPS'
);

export const objectIdParamsSchema = z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid resource identifier')
}).strict();

export const requireAtLeastOneField = (schema) => schema.refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field is required' }
);
