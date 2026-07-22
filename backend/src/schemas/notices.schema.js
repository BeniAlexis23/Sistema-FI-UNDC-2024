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
