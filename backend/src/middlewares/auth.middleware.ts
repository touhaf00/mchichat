import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

type AuthUser = {
    userId: string;
    email: string;
    role: string;
};

export function authenticate(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Token manquant ou invalide",
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthUser;

        req.user = decoded;

        next();
    } catch (_error) {
        return res.status(401).json({
            message: "Token invalide ou expiré",
        });
    }
}