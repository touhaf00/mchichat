import { z } from "zod";

export const createMessageSchema = z
    .object({
        content: z.string().trim().max(1000, "Message trop long").optional(),
        salonId: z.string().trim().min(1, "Salon id requis"),
        attachmentUrl: z.string().optional().nullable(),
    })
    .refine(
        (data) => Boolean(data.content?.trim()) || Boolean(data.attachmentUrl),
        {
            message: "Le message doit contenir du texte ou un fichier",
        }
    );

export const updateMessageSchema = z.object({
    content: z
        .string()
        .trim()
        .min(1, "Le message ne peut pas être vide")
        .max(1000, "Message trop long"),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;

export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;