import { Request, Response } from "express";
import { ZodError } from "zod";

const safeMessages = new Set([
    "Email ou mot de passe incorrect",
    "Email ou nom d'utilisateur déjà utilisé",
    "Utilisateur introuvable",
    "Profil introuvable",
    "Salon introuvable",
    "Message introuvable",
    "Publication introuvable",
    "Conversation introuvable",
    "Ami introuvable",
    "Invitation introuvable",
    "Accès refusé",
    "Accès réservé aux administrateurs",
    "Non autorisé",
    "Token manquant ou invalide",
    "Token invalide ou expiré",
    "Refresh token manquant",
    "Refresh token invalide ou expiré",
    "Type de fichier non autorisé",
    "Seules les images sont autorisées",
    "Seules les images et vidéos autorisées sont acceptées",
]);

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
) {
    console.error(err);

    if (err instanceof ZodError) {
        return res.status(400).json({
            message: "Données invalides",
            errors: err.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
    }

    if (err instanceof Error) {
        const isProduction = process.env.NODE_ENV === "production";

        return res.status(400).json({
            message:
                isProduction && !safeMessages.has(err.message)
                    ? "Une erreur est survenue"
                    : err.message,
        });
    }

    return res.status(500).json({
        message: "Erreur interne du serveur",
    });
}