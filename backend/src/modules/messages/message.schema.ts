import { z } from "zod";

export const createMessageSchema = z.object({
    content: z
        .string()
        .min(1, "Le message ne peut pas être vide")
        .max(1000, "Message trop long"),
    salonId: z.string(),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;