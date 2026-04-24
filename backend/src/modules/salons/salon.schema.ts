import { z } from "zod";

export const createSalonSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Le nom du salon doit contenir au moins 2 caractères")
        .max(100, "Le nom du salon ne peut pas dépasser 100 caractères"),

    description: z
        .string()
        .trim()
        .max(500, "La description ne peut pas dépasser 500 caractères")
        .optional()
        .default(""),

    visibility: z.enum(["PUBLIC", "PRIVATE"], {
        message: "La visibilité doit être PUBLIC ou PRIVATE",
    }),
});

export const updateSalonSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Le nom du salon doit contenir au moins 2 caractères")
        .max(100, "Le nom du salon ne peut pas dépasser 100 caractères")
        .optional(),

    description: z
        .string()
        .trim()
        .max(500, "La description ne peut pas dépasser 500 caractères")
        .optional(),

    visibility: z
        .enum(["PUBLIC", "PRIVATE"], {
            message: "La visibilité doit être PUBLIC ou PRIVATE",
        })
        .optional(),
});

export type CreateSalonInput = z.infer<typeof createSalonSchema>;
export type UpdateSalonInput = z.infer<typeof updateSalonSchema>;