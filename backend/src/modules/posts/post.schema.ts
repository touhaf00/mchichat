import { z } from "zod";

export const createPostSchema = z.object({
    content: z.string().trim().max(2000, "Le post est trop long").optional(),
});

export const updatePostSchema = z.object({
    content: z.string().trim().max(2000, "Le post est trop long").optional(),
});

export const createCommentSchema = z
    .object({
        content: z
            .string()
            .trim()
            .max(500, "Le commentaire est trop long")
            .optional(),

        gifUrl: z
            .string()
            .url("URL du GIF invalide")
            .optional(),
    })
    .refine(
        (data) => Boolean(data.content?.trim()) || Boolean(data.gifUrl),
        {
            message: "Le commentaire doit contenir du texte ou un GIF",
        }
    );

export type CreateCommentInput = z.infer<typeof createCommentSchema>;