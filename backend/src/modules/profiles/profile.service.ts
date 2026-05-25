import { prisma } from "../../lib/prisma";
import type { UpdateProfileInput } from "./profile.schema";

function postInclude() {
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

function formatPost<TPost extends { likes: { userId: string }[]; comments: unknown[] }>(
    post: TPost,
    userId?: string
) {
    return {
        ...post,
        likesCount: post.likes.length,
        commentsCount: post.comments.length,
        isLikedByMe: userId ? post.likes.some((like) => like.userId === userId) : false,
    };
}

export async function getProfileByUsername(username: string, currentUserId?: string) {
    const user = await prisma.user.findUnique({
        where: {
            username,
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
            _count: {
                select: {
                    posts: true,
                    memberships: true,
                    ownedSalons: true,
                },
            },
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
        include: postInclude(),
    });

    let friendshipStatus: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "FRIENDS" | "ME" =
        "NONE";

    if (currentUserId && currentUserId === user.id) {
        friendshipStatus = "ME";
    } else if (currentUserId) {
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

        if (friendship?.status === "ACCEPTED") {
            friendshipStatus = "FRIENDS";
        } else if (friendship?.status === "PENDING" && friendship.senderId === currentUserId) {
            friendshipStatus = "PENDING_SENT";
        } else if (friendship?.status === "PENDING" && friendship.receiverId === currentUserId) {
            friendshipStatus = "PENDING_RECEIVED";
        }
    }

    return {
        user,
        posts: posts.map((post) => formatPost(post, currentUserId)),
        friendshipStatus,
    };
}

export async function updateMyProfile(
    userId: string,
    data: UpdateProfileInput,
    files?: {
        avatarUrl?: string | null;
        bannerUrl?: string | null;
    }
) {
    if (data.username) {
        const existingUsername = await prisma.user.findUnique({
            where: {
                username: data.username,
            },
        });

        if (existingUsername && existingUsername.id !== userId) {
            throw new Error("Ce nom d'utilisateur est déjà utilisé");
        }
    }

    return prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            username: data.username,
            bio: data.bio,
            ...(files?.avatarUrl ? { avatarUrl: files.avatarUrl } : {}),
            ...(files?.bannerUrl ? { bannerUrl: files.bannerUrl } : {}),
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
export async function deleteMyAccount(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error("Utilisateur introuvable");
    }

    await prisma.friendship.deleteMany({
        where: {
            OR: [{ senderId: userId }, { receiverId: userId }],
        },
    });

    await prisma.user.delete({
        where: { id: userId },
    });

    return {
        message: "Compte supprimé avec succès",
    };
}