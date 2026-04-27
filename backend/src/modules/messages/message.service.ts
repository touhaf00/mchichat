import { prisma } from "../../lib/prisma";
import { CreateMessageInput } from "./message.schema";

export async function getMessagesBySalon(salonId: string) {
    return prisma.message.findMany({
        where: { salonId },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                },
            },
        },
        orderBy: {
            createdAt: "asc",
        },
    });
}

export async function createMessage(data: CreateMessageInput, userId: string) {
    return prisma.message.create({
        data: {
            content: data.content,
            salonId: data.salonId,
            authorId: userId,
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