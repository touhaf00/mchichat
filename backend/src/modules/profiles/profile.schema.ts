import { z } from "zod";

export const updateProfileSchema = z.object({
    firstName: z
        .string()
        .trim()
        .min(2, "Le prénom doit contenir au moins 2 caractères")
        .max(50, "Le prénom est trop long"),

    lastName: z
        .string()
        .trim()
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(50, "Le nom est trop long"),

    username: z
        .string()
        .trim()
        .min(3, "Le username doit contenir au moins 3 caractères")
        .max(30, "Le username est trop long"),

    bio: z
        .string()
        .trim()
        .max(500, "La bio ne peut pas dépasser 500 caractères")
        .optional()
        .nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;