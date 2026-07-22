import { z } from "zod";

export const loginSchema = z.object({
    email: z.string({ required_error: 'Email is required' }).trim().toLowerCase().email({ message: 'Email is not valid' }).max(160),
    password: z.string({ required_error: 'Password is required' }).min(6, { message: 'Password must be at least 6 characters' }).max(128)
}).strict();

export const changePasswordSchema = z.object({
    currentPassword: z.string({ required_error: 'Current password is required' }).min(6).max(128),
    newPassword: z.string({ required_error: 'New password is required' }).min(8).max(128)
}).strict().refine((values) => values.currentPassword !== values.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword']
});
