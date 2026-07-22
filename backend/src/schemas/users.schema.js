import { z } from "zod";

const roleSchema = z.enum(["admin", "editor"]);

export const createUserSchema = z.object({
    username: z.string().trim().min(2).max(80),
    email: z.string().trim().toLowerCase().email().max(160),
    password: z.string().min(8).max(128),
    role: roleSchema.default("editor")
}).strict();

export const updateUserSchema = z.object({
    username: z.string().trim().min(2).max(80).optional(),
    email: z.string().trim().toLowerCase().email().max(160).optional(),
    role: roleSchema.optional(),
    active: z.boolean().optional()
}).strict().refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required"
});

export const resetPasswordSchema = z.object({
    password: z.string().min(8).max(128)
}).strict();
