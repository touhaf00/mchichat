import { prisma } from "../../lib/prisma";
import {
    CreatePrivateConversationInput,
    CreatePrivateMessageInput,
} from "./privateMessage.schema";

async function areFriends(userId: string, friendId: string) {
    const friendship = await prisma.friendship.findFirst({
        where: {
            status: "ACCEPTED",
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
        },
    });

    return Boolean(friendship);
}

async function isConversationParticipant(
    conversationId: string,
    userId: string
) {
    const participant = await prisma.privateConversationParticipant.findUnique({
        where: {
            conversationId_userId: {
                conversationId,
                userId,
            },
        },
    });

    return Boolean(participant);
}

export async function getPrivateConversations(userId: string) {
    return prisma.privateConversation.findMany({
        where: {
            participants: {
                some: {
                    userId,
                },
            },
        },
        include: {
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            },
            messages: {
                take: 1,
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            updatedAt: "desc",
        },
    });
}

export async function createPrivateConversation(
    userId: string,
    data: CreatePrivateConversationInput
) {
    if (userId === data.friendId) {
        throw new Error("Vous ne pouvez pas créer une conversation avec vous-même");
    }

    const friend = await prisma.user.findUnique({
        where: {
            id: data.friendId,
        },
    });

    if (!friend) {
        throw new Error("Utilisateur introuvable");
    }

    const isFriend = await areFriends(userId, data.friendId);

    if (!isFriend) {
        throw new Error("Vous devez être amis pour envoyer un message privé");
    }

    const existingConversation = await prisma.privateConversation.findFirst({
        where: {
            AND: [
                {
                    participants: {
                        some: {
                            userId,
                        },
                    },
                },
                {
                    participants: {
                        some: {
                            userId: data.friendId,
                        },
                    },
                },
            ],
        },
        include: {
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            },
            messages: {
                take: 1,
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    });

    if (existingConversation) {
        return existingConversation;
    }

    return prisma.privateConversation.create({
        data: {
            participants: {
                create: [
                    {
                        userId,
                    },
                    {
                        userId: data.friendId,
                    },
                ],
            },
        },
        include: {
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            },
            messages: true,
        },
    });
}

export async function getPrivateMessages(
    conversationId: string,
    userId: string
) {
    const canAccess = await isConversationParticipant(conversationId, userId);

    if (!canAccess) {
        throw new Error("Vous n'êtes pas autorisé à accéder à cette conversation");
    }

    return prisma.privateMessage.findMany({
        where: {
            conversationId,
        },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                },
            },
        },
        orderBy: {
            createdAt: "asc",
        },
    });
}

export async function createPrivateMessage(
    conversationId: string,
    userId: string,
    data: CreatePrivateMessageInput
) {
    const canAccess = await isConversationParticipant(conversationId, userId);

    if (!canAccess) {
        throw new Error("Vous n'êtes pas autorisé à écrire dans cette conversation");
    }

    const message = await prisma.privateMessage.create({
        data: {
            content: data.content,
            conversationId,
            authorId: userId,
        },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                },
            },
        },
    });

    await prisma.privateConversation.update({
        where: {
            id: conversationId,
        },
        data: {
            updatedAt: new Date(),
        },
    });

    return message;
}

export async function deletePrivateMessage(messageId: string, userId: string) {
    const message = await prisma.privateMessage.findUnique({
        where: {
            id: messageId,
        },
    });

    if (!message) {
        throw new Error("Message privé introuvable");
    }

    if (message.authorId !== userId) {
        throw new Error("Vous n'êtes pas autorisé à supprimer ce message");
    }

    await prisma.privateMessage.delete({
        where: {
            id: messageId,
        },
    });

    return {
        message: "Message privé supprimé avec succès",
    };
}
