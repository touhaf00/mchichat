import { prisma } from "../../lib/prisma";
import type { UpdateUserRoleInput } from "./admin.schema";

export async function getAdminStats() {
    const [
        usersCount,
        salonsCount,
        messagesCount,
        privateMessagesCount,
        postsCount,
        commentsCount,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.salon.count(),
        prisma.message.count(),
        prisma.privateMessage.count(),
        prisma.post.count(),
        prisma.postComment.count(),
    ]);

    return {
        usersCount,
        salonsCount,
        messagesCount,
        privateMessagesCount,
        postsCount,
        commentsCount,
    };
}

export async function getAllUsers() {
    return prisma.user.findMany({
        orderBy: {
            createdAt: "desc",
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
            _count: {
                select: {
                    posts: true,
                    messages: true,
                    privateMessages: true,
                    memberships: true,
                },
            },
        },
    });
}

export async function updateUserRole(
    currentAdminId: string,
    targetUserId: string,
    data: UpdateUserRoleInput
) {
    if (currentAdminId === targetUserId && data.role !== "ADMIN") {
        throw new Error("Un administrateur ne peut pas retirer son propre rôle admin");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: targetUserId,
        },
    });

    if (!user) {
        throw new Error("Utilisateur introuvable");
    }

    return prisma.user.update({
        where: {
            id: targetUserId,
        },
        data: {
            role: data.role,
        },
        select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true,
            updatedAt: true,
        },
    });
}

export async function deleteUserByAdmin(
    currentAdminId: string,
    targetUserId: string
) {
    if (currentAdminId === targetUserId) {
        throw new Error("Un administrateur ne peut pas supprimer son propre compte ici");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: targetUserId,
        },
    });

    if (!user) {
        throw new Error("Utilisateur introuvable");
    }

    await prisma.friendship.deleteMany({
        where: {
            OR: [
                { senderId: targetUserId },
                { receiverId: targetUserId },
            ],
        },
    });

    await prisma.user.delete({
        where: {
            id: targetUserId,
        },
    });

    return {
        message: "Utilisateur supprimé avec succès",
    };
}