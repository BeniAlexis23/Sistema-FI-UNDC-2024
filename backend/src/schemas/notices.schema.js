import { z } from "zod";

export const createNoticeSchema = z.object({
    title: z.string({ required_error: "Title is required" }),
    description: z.string({required_error: "Description must be a String"}),
    imageUrl: z.string({required_error: "Url is required"}).url({ message: "Invalid imageURL format" }),
    date: z.string().datetime().optional()
})