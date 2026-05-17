import { prisma } from "../../lib/prisma";
import type { UpdateProfileInput } from "./profile.schema";

function postInclude(userId: string) {
    return {
        author: {
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
            },
        },
        likes: {
            select: {
                userId: true,
            },
        },
        comments: {
            orderBy: {
                createdAt: "asc" as const,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                    },
                },
            },
        },
    };
}

function formatPost(
    post: {
        likes: { userId: string }[];
        comments: unknown[];
    },
    userId: string
) {
    return {
        ...post,
        likesCount: post.likes.length,
        commentsCount: post.comments.length,
        isLikedByMe: post.likes.some((like) => like.userId === userId),
    };
}

export async function getProfileByUsername(username: string, currentUserId: string) {
    const user = await prisma.user.findUnique({
        where: { username },
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
        throw new Error("Profil introuvable");
    }

    const posts = await prisma.post.findMany({
        where: {
            authorId: user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: postInclude(currentUserId),
    });

    const friendship = await prisma.friendship.findFirst({
        where: {
            OR: [
                {
                    senderId: currentUserId,
                    receiverId: user.id,
                },
                {
                    senderId: user.id,
                    receiverId: currentUserId,
                },
            ],
        },
    });

    return {
        user,
        posts: posts.map((post) => formatPost(post, currentUserId)),
        friendshipStatus: friendship?.status ?? null,
        isMe: user.id === currentUserId,
    };
}

export async function getMyProfile(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
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

    return user;
}

export async function updateMyProfile(userId: string, data: UpdateProfileInput) {
    const existingUsername = await prisma.user.findFirst({
        where: {
            username: data.username,
            id: {
                not: userId,
            },
        },
    });

    if (existingUsername) {
        throw new Error("Ce username est déjà utilisé");
    }

    return prisma.user.update({
        where: { id: userId },
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            username: data.username,
            bio: data.bio || null,
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
}

export async function updateAvatar(userId: string, avatarUrl: string) {
    return prisma.user.update({
        where: { id: userId },
        data: {
            avatarUrl,
        },
        select: {
            id: true,
            avatarUrl: true,
        },
    });
}

export async function updateBanner(userId: string, bannerUrl: string) {
    return prisma.user.update({
        where: { id: userId },
        data: {
            bannerUrl,
        },
        select: {
            id: true,
            bannerUrl: true,
        },
    });
}