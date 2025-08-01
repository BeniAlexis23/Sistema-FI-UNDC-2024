import { z } from "zod";

export const createDecretoSchema = z.object({
    title: z.string({ required_error: "Title is required" }),
    description: z.string({required_error: "Description must be a String"}),
    url: z.string().url({ message: "Invalid URL format" }),
    date: z.string().datetime().optional()
})