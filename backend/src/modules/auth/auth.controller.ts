import type { NextFunction, Request, Response } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import { loginSchema, registerSchema } from "./auth.schema";
import { getMe, loginUser, registerUser } from "./auth.service";
import { env } from "../../config/env";

type TokenPayload = {
    userId: string;
    email: string;
    role: string;
};

function createAccessToken(payload: TokenPayload) {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    } as SignOptions);
}

function createRefreshToken(payload: TokenPayload) {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as SignOptions);
}

function setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
    });
}

export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const data = registerSchema.parse(req.body);
        const result = await registerUser(data);

        const payload: TokenPayload = {
            userId: result.user.id,
            email: result.user.email,
            role: result.user.role,
        };

        const accessToken = createAccessToken(payload);
        const refreshToken = createRefreshToken(payload);

        setRefreshCookie(res, refreshToken);

        return res.status(201).json({
            message: "Utilisateur créé avec succès",
            user: result.user,
            accessToken,
        });
    } catch (error) {
        next(error);
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const data = loginSchema.parse(req.body);
        const result = await loginUser(data);

        const payload: TokenPayload = {
            userId: result.user.id,
            email: result.user.email,
            role: result.user.role,
        };

        const accessToken = createAccessToken(payload);
        const refreshToken = createRefreshToken(payload);

        setRefreshCookie(res, refreshToken);

        return res.status(200).json({
            message: "Connexion réussie",
            user: result.user,
            accessToken,
        });
    } catch (error) {
        next(error);
    }
}

export async function refresh(req: Request, res: Response) {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token manquant",
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            env.JWT_REFRESH_SECRET
        ) as TokenPayload;

        const accessToken = createAccessToken({
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        });

        return res.status(200).json({
            accessToken,
        });
    } catch {
        return res.status(401).json({
            message: "Refresh token invalide ou expiré",
        });
    }
}

export async function logout(_req: Request, res: Response) {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
        message: "Déconnexion réussie",
    });
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

        return res.status(200).json({
            user,
        });
    } catch (error) {
        next(error);
    }
}