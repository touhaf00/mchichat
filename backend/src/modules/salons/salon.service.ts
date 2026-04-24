import { prisma } from "../../lib/prisma";
import { CreateSalonInput, UpdateSalonInput } from "./salon.schema";

export async function getAllSalons() {
    return prisma.salon.findMany({
        orderBy: {
            createdAt: "desc",
        },
        include: {
            owner: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
        },
    });
}

export async function getSalonById(salonId: string | string[]) {
    const salon = await prisma.salon.findUnique({
        where: { id: salonId },
        include: {
            owner: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                },
            },
            messages: {
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "asc",
                },
            },
        },
    });

    if (!salon) {
        throw new Error("Salon introuvable");
    }

    return salon;
}

export async function createSalon(data: CreateSalonInput, ownerId: string) {
    const salon = await prisma.salon.create({
        data: {
            name: data.name,
            description: data.description,
            visibility: data.visibility,
            ownerId,
            members: {
                create: {
                    userId: ownerId,
                },
            },
        },
        include: {
            owner: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
        },
    });

    return salon;
}

export async function updateSalon(
    salonId: string | string[],
    data: UpdateSalonInput,
    userId: string
) {
    const existingSalon = await prisma.salon.findUnique({
        where: { id: salonId },
    });

    if (!existingSalon) {
        throw new Error("Salon introuvable");
    }

    if (existingSalon.ownerId !== userId) {
        throw new Error("Vous n'êtes pas autorisé à modifier ce salon");
    }

    const updatedSalon = await prisma.salon.update({
        where: { id: salonId },
        data,
        include: {
            owner: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
        },
    });

    return updatedSalon;
}

export async function deleteSalon(salonId: string | string[], userId: string) {
    const existingSalon = await prisma.salon.findUnique({
        where: { id: salonId },
    });

    if (!existingSalon) {
        throw new Error("Salon introuvable");
    }

    if (existingSalon.ownerId !== userId) {
        throw new Error("Vous n'êtes pas autorisé à supprimer ce salon");
    }

    await prisma.salonMember.deleteMany({
        where: { salonId },
    });

    await prisma.message.deleteMany({
        where: { salonId },
    });

    await prisma.salon.delete({
        where: { id: salonId },
    });

    return {
        message: "Salon supprimé avec succès",
    };
}