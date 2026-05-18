import { z } from "zod";

export const createPrivateConversationSchema = z.object({
    friendId: z.string().min(1, "Friend id requis"),
});

export const createPrivateMessageSchema = z
    .object({
        content: z.string().trim().max(2000, "Le message est trop long").optional(),
        gifUrl: z.string().url("URL du GIF invalide").optional(),
        attachmentUrl: z.string().optional().nullable(),
    })
    .refine(
        (data) =>
            Boolean(data.content?.trim()) ||
            Boolean(data.gifUrl) ||
            Boolean(data.attachmentUrl),
        {
            message: "Le message doit contenir du texte, un GIF ou un fichier",
        }
    );

export type CreatePrivateConversationInput = z.infer<
    typeof createPrivateConversationSchema
>;

export type CreatePrivateMessageInput = z.infer<
    typeof createPrivateMessageSchema
>;