import { prisma } from "../../lib/prisma";
import {
    SendFriendRequestInput,
    UpdateFriendRequestInput,
} from "./friend.schema";

export async function searchUsersByUsername(username: string, currentUserId: string) {
    return prisma.user.findMany({
        where: {
            username: {
                contains: username,
            },
            id: {
                not: currentUserId,
            },
        },
        select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            createdAt: true,
        },
        take: 10,
    });
}

export async function sendFriendRequest(
    senderId: string,
    data: SendFriendRequestInput
) {
    if (senderId === data.receiverId) {
        throw new Error("Vous ne pouvez pas vous ajouter vous-même");
    }

    const receiver = await prisma.user.findUnique({
        where: { id: data.receiverId },
    });

    if (!receiver) {
        throw new Error("Utilisateur introuvable");
    }

    const existingRequest = await prisma.friendship.findFirst({
        where: {
            OR: [
                {
                    senderId,
                    receiverId: data.receiverId,
                },
                {
                    senderId: data.receiverId,
                    receiverId: senderId,
                },
            ],
        },
    });

    if (existingRequest) {
        if (existingRequest.status === "PENDING") {
            throw new Error("Une demande d'amitié existe déjà");
        }

        if (existingRequest.status === "ACCEPTED") {
            throw new Error("Vous êtes déjà amis");
        }
    }

    return prisma.friendship.create({
        data: {
            senderId,
            receiverId: data.receiverId,
            status: "PENDING",
        },
        include: {
            receiver: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
        },
    });
}

export async function getReceivedFriendRequests(userId: string) {
    return prisma.friendship.findMany({
        where: {
            receiverId: userId,
            status: "PENDING",
        },
        include: {
            sender: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function getSentFriendRequests(userId: string) {
    return prisma.friendship.findMany({
        where: {
            senderId: userId,
            status: "PENDING",
        },
        include: {
            receiver: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function respondToFriendRequest(
    requestId: string,
    userId: string,
    data: UpdateFriendRequestInput
) {
    const request = await prisma.friendship.findUnique({
        where: {
            id: requestId,
        },
    });

    if (!request) {
        throw new Error("Demande d'amitié introuvable");
    }

    if (request.receiverId !== userId) {
        throw new Error("Vous n'êtes pas autorisé à répondre à cette demande");
    }

    if (request.status !== "PENDING") {
        throw new Error("Cette demande a déjà été traitée");
    }

    return prisma.friendship.update({
        where: {
            id: requestId,
        },
        data: {
            status: data.status,
        },
        include: {
            sender: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
        },
    });
}

export async function getFriends(userId: string) {
    const friendships = await prisma.friendship.findMany({
        where: {
            status: "ACCEPTED",
            OR: [
                { senderId: userId },
                { receiverId: userId },
            ],
        },
        include: {
            sender: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
            receiver: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
        },
    });

    return friendships.map((friendship) => {
        return friendship.senderId === userId
            ? friendship.receiver
            : friendship.sender;
    });
}

export async function removeFriend(userId: string, friendId: string) {
    const friendship = await prisma.friendship.findFirst({
        where: {
            OR: [
                {
                    senderId: userId,
                    receiverId: friendId,
                },
                {
                    senderId: friendId,
                    receiverId: userId,
                },
            ],
            status: "ACCEPTED",
        },
    });

    if (!friendship) {
        throw new Error("Ami introuvable");
    }

    await prisma.friendship.delete({
        where: {
            id: friendship.id,
        },
    });

    return {
        message: "Ami supprimé",
    };
}