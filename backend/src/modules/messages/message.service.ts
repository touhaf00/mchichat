import { prisma } from "../../lib/prisma";
import { CreateMessageInput } from "./message.schema";

export async function getMessagesBySalon(salonId: string, userId: string) {
    await canAccessSalon(salonId, userId);

    return prisma.message.findMany({
        where: {
            salonId,
        },
        orderBy: {
            createdAt: "asc",
        },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
        },
    });
}

export async function createMessage({salonId, authorId, content,}: {
    salonId: string;
    authorId: string;
    content: string;
}) {
    await canAccessSalon(salonId, authorId);

    return prisma.message.create({
        data: {
            salonId,
            authorId,
            content,
        },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
        },
    });
}

export async function deleteMessage(messageId: string, userId: string) {
    const message = await prisma.message.findUnique({
        where: { id: messageId },
    });

    if (!message) throw new Error("Message introuvable");

    if (message.authorId !== userId) {
        throw new Error("Non autorisé");
    }

    await prisma.message.delete({
        where: { id: messageId },
    });

    return { message: "Message supprimé" };
}

async function canAccessSalon(salonId: string, userId: string) {
    const salon = await prisma.salon.findUnique({
        where: { id: salonId },
        include: {
            members: true,
        },
    });

    if (!salon) {
        throw new Error("Salon introuvable");
    }

    const isOwner = salon.ownerId === userId;
    const isMember = salon.members.some((member) => member.userId === userId);

    if (salon.visibility === "PRIVATE" && !isOwner && !isMember) {
        throw new Error("Accès interdit à ce salon privé");
    }

    return salon;
}

