import { z } from "zod";

export const createPrivateConversationSchema = z.object({friendId: z.string().min(1, "Friend id requis"),});

export const createPrivateMessageSchema = z.object({
    content: z.string().trim().min(1, "Le message ne peut pas être vide")
        .max(2000, "Le message est trop long"),
});

export type CreatePrivateConversationInput = z.infer<typeof createPrivateConversationSchema>;

export type CreatePrivateMessageInput = z.infer<typeof createPrivateMessageSchema>;
