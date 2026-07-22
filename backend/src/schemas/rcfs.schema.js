import { z } from 'zod';
import { dateSchema, descriptionSchema, httpUrlSchema, requireAtLeastOneField, titleSchema } from './common.schema.js';

export const createRcfSchema = z.object({
    title: titleSchema,
    description: descriptionSchema,
    url: httpUrlSchema,
    date: dateSchema.optional()
}).strict();

export const updateRcfSchema = requireAtLeastOneField(z.object({
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    url: httpUrlSchema.optional(),
    date: dateSchema.optional()
}).strict());
