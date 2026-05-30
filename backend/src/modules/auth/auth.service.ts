import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import type { LoginInput, RegisterInput } from "./auth.schema";
import { sanitizeString } from "../../utils/sanitize";

function publicUser(user: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    bio: string | null;
    avatarUrl: string | null;
    bannerUrl: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}) {
    return {
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
        updatedAt: user.updatedAt,
    };
}

export async function registerUser(data: RegisterInput) {
    const email = data.email.toLowerCase().trim();
    const username = sanitizeString(data.username);
    const firstName = sanitizeString(data.firstName);
    const lastName = sanitizeString(data.lastName);

    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ email }, { username }],
        },
    });

    if (existingUser) {
        throw new Error("Email ou nom d'utilisateur déjà utilisé");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
        data: {
            email,
            username,
            firstName,
            lastName,
            passwordHash,
        },
        select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            bio: true,
            avatarUrl: true,
            bannerUrl: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return {
        user: publicUser(user),
    };
}

export async function loginUser(data: LoginInput) {
    const email = data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
        where: {
            email,
        },
        select: {
            id: true,
            email: true,
            username: true,
            passwordHash: true,
            firstName: true,
            lastName: true,
            bio: true,
            avatarUrl: true,
            bannerUrl: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user) {
        throw new Error("Email ou mot de passe incorrect");
    }

    const isPasswordValid = await bcrypt.compare(
        data.password,
        user.passwordHash
    );

    if (!isPasswordValid) {
        throw new Error("Email ou mot de passe incorrect");
    }

    return {
        user: publicUser(user),
    };
}

export async function getMe(userId: string) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            bio: true,
            avatarUrl: true,
            bannerUrl: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user) {
        throw new Error("Utilisateur introuvable");
    }

    return publicUser(user);
}