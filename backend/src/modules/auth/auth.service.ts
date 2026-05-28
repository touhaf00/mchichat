import bcrypt from "bcrypt";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { LoginInput, RegisterInput } from "./auth.schema";

type JwtPayload = {
    userId: string;
    email: string;
    role: string;
};

function generateAccessToken(payload: JwtPayload): string {
    const secret: Secret = env.JWT_ACCESS_SECRET;

    const options: SignOptions = {
        expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    };

    return jwt.sign(payload, secret, options);
}

export async function registerUser(data: RegisterInput) {
    const existingEmail = await prisma.user.findUnique({
        where: { email: data.email },
    });

    if (existingEmail) {
        throw new Error("Cet email est déjà utilisé");
    }

    const existingUsername = await prisma.user.findUnique({
        where: { username: data.username },
    });

    if (existingUsername) {
        throw new Error("Ce nom d'utilisateur est déjà utilisé");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
        data: {
            email: data.email,
            username: data.username,
            passwordHash,
            firstName: data.firstName,
            lastName: data.lastName,
        },
        select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
            bio: true,
            avatarUrl: true,
            bannerUrl: true,
        },
    });

    const token = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
    });

    return {
        user,
        token,
    };
}

export async function loginUser(data: LoginInput) {
    const user = await prisma.user.findUnique({
        where: { email: data.email },
    });

    if (!user) {
        throw new Error("Email ou mot de passe invalide");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
        throw new Error("Email ou mot de passe invalide");
    }

    const token = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
    });

    return {
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            bio: user.bio,
            avatarUrl: user.avatarUrl,
            bannerUrl: user.bannerUrl,
            role: user.role,
            createdAt: user.createdAt,
        },
        token,
    };
}

export async function getMe(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            bio: true,
            avatarUrl: true,
            bannerUrl: true,
        },
    });

    if (!user) {
        throw new Error("Utilisateur introuvable");
    }

    return user;
}