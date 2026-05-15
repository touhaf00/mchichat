import { z } from "zod";

export const createPostSchema = z
    .object({
        content: z.string().trim().max(2000, "Le post est trop long").optional(),
    })
    .refine((data) => Boolean(data.content?.trim()), {
        message: "Le post doit contenir du texte ou un média",
        path: ["content"],
    });

export const updatePostSchema = z.object({
    content: z.string().trim().max(2000, "Le post est trop long").optional(),
});

export const createCommentSchema = z.object({
    content: z
        .string()
        .trim()
        .min(1, "Le commentaire est requis")
        .max(500, "Le commentaire est trop long"),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;