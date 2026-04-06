import { Request, Response, NextFunction } from "express";
import { loginSchema, registerSchema } from "./auth.schema";
import { getMe, loginUser, registerUser } from "./auth.service";

export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const data = registerSchema.parse(req.body);

        const result = await registerUser(data);

        res.status(201).json({
            message: "Utilisateur créé avec succès",
            ...result,
        });
    } catch (error) {
        next(error);
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const data = loginSchema.parse(req.body);

        const result = await loginUser(data);

        res.status(200).json({
            message: "Connexion réussie",
            ...result,
        });
    } catch (error) {
        next(error);
    }
}

export async function me(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Non autorisé",
            });
        }

        const user = await getMe(userId);

        res.status(200).json({
            user,
        });
    } catch (error) {
        next(error);
    }
}