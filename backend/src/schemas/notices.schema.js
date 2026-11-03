import { z } from 'zod';
import { dateSchema, descriptionSchema, requireAtLeastOneField, titleSchema } from './common.schema.js';

export const createNoticeSchema = z.object({
    title: titleSchema,
    description: descriptionSchema,
    date: dateSchema.optional()
}).strict();

export const updateNoticeSchema = requireAtLeastOneField(z.object({
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    date: dateSchema.optional()
}).strict());

export const publicNoticesQuerySchema = z.object({
    limit: z.coerce.number().int().min(1, 'Invalid limit').max(50, 'Invalid limit').optional(),
    category: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{1,60}$/, 'Invalid category').optional(),
    featuredFirst: z.enum(['1', 'true']).optional()
});
