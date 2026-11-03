import { z } from 'zod';
import { requireAtLeastOneField } from './common.schema.js';

const nameSchema = z.string().trim().min(2, 'Category name is too short').max(40, 'Category name is too long');

export const createCategorySchema = z.object({
    name: nameSchema
}).strict();

export const updateCategorySchema = requireAtLeastOneField(z.object({
    name: nameSchema.optional(),
    order: z.number().int().min(0).max(999).optional()
}).strict());
