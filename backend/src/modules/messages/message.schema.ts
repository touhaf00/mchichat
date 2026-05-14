import { z } from "zod";

export const createMessageSchema = z.object({
    content: z
        .string()
        .trim()
        .min(1, "Le message ne peut pas être vide")
        .max(1000, "Message trop long"),
    salonId: z.string().min(1, "Salon id requis"),
});

export const updateMessageSchema = z.object({
    content: z
        .string()
        .trim()
        .min(1, "Le message ne peut pas être vide")
        .max(1000, "Message trop long"),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;