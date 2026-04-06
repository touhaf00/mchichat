import { z } from "zod";

export const registerSchema = z.object({
    email: z.email("Email invalide").trim().toLowerCase(),
    username: z
        .string()
        .trim()
        .min(3, "Le username doit contenir au moins 3 caractères")
        .max(30, "Le username ne peut pas dépasser 30 caractères"),
    password: z
        .string()
        .min(6, "Le mot de passe doit contenir au moins 6 caractères")
        .max(100, "Le mot de passe est trop long"),
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
});

export const loginSchema = z.object({
    email: z.email("Email invalide").trim().toLowerCase(),
    password: z
        .string()
        .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;