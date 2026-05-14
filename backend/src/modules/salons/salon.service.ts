import { prisma } from "../../lib/prisma";
import { CreateSalonInput, UpdateSalonInput } from "./salon.schema";
import {
    SalonMembershipRequestStatus,
    SalonVisibility,
} from "@prisma/client";

export async function getSalons(userId: string) {
    return prisma.salon.findMany({
        where: {
            OR: [
                { visibility: "PUBLIC" },
                { ownerId: userId },
                {
                    members: {
                        some: {
                            userId,
                        },
                    },
                },
            ],
        },
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
        },
    });
}

export async function getSalonById(salonId: string, userId: string) {
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
    salonId: string,
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

export async function deleteSalon(salonId: string, userId: string) {
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

export async function requestSalonMembership(salonId: string, userId: string) {
    const salon = await prisma.salon.findUnique({
        where: { id: salonId },
    });

    if (!salon) {
        throw new Error("Salon introuvable");
    }

    if (salon.visibility !== SalonVisibility.PUBLIC) {
        throw new Error("Tu peux demander l'adhésion uniquement aux salons publics");
    }

    if (salon.ownerId === userId) {
        throw new Error("Tu es déjà propriétaire de ce salon");
    }

    const alreadyMember = await prisma.salonMember.findUnique({
        where: {
            userId_salonId: {
                userId,
                salonId,
            },
        },
    });

    if (alreadyMember) {
        throw new Error("Tu es déjà membre de ce salon");
    }

    const existingRequest = await prisma.salonMembershipRequest.findUnique({
        where: {
            salonId_requesterId: {
                salonId,
                requesterId: userId,
            },
        },
    });

    if (existingRequest?.status === SalonMembershipRequestStatus.PENDING) {
        throw new Error("Ta demande est déjà en attente");
    }

    if (existingRequest?.status === SalonMembershipRequestStatus.ACCEPTED) {
        throw new Error("Ta demande a déjà été acceptée");
    }

    if (existingRequest?.status === SalonMembershipRequestStatus.REJECTED) {
        return prisma.salonMembershipRequest.update({
            where: {
                salonId_requesterId: {
                    salonId,
                    requesterId: userId,
                },
            },
            data: {
                status: SalonMembershipRequestStatus.PENDING,
            },
            include: {
                salon: true,
                requester: {
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

    return prisma.salonMembershipRequest.create({
        data: {
            salonId,
            requesterId: userId,
        },
        include: {
            salon: true,
            requester: {
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

export async function getSalonMembershipRequests(ownerId: string) {
    return prisma.salonMembershipRequest.findMany({
        where: {
            status: SalonMembershipRequestStatus.PENDING,
            salon: {
                ownerId,
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            salon: true,
            requester: {
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

export async function acceptSalonMembershipRequest(
    requestId: string,
    ownerId: string
) {
    const request = await prisma.salonMembershipRequest.findUnique({
        where: { id: requestId },
        include: {
            salon: true,
        },
    });

    if (!request) {
        throw new Error("Demande d'adhésion introuvable");
    }

    if (request.salon.ownerId !== ownerId) {
        throw new Error("Seul le propriétaire du salon peut accepter cette demande");
    }

    if (request.status !== SalonMembershipRequestStatus.PENDING) {
        throw new Error("Cette demande a déjà été traitée");
    }

    return prisma.$transaction(async (tx) => {
        await tx.salonMember.upsert({
            where: {
                userId_salonId: {
                    userId: request.requesterId,
                    salonId: request.salonId,
                },
            },
            update: {},
            create: {
                userId: request.requesterId,
                salonId: request.salonId,
            },
        });

        return tx.salonMembershipRequest.update({
            where: { id: requestId },
            data: {
                status: SalonMembershipRequestStatus.ACCEPTED,
            },
            include: {
                salon: true,
                requester: {
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
    });
}

export async function rejectSalonMembershipRequest(
    requestId: string,
    ownerId: string
) {
    const request = await prisma.salonMembershipRequest.findUnique({
        where: { id: requestId },
        include: {
            salon: true,
        },
    });

    if (!request) {
        throw new Error("Demande d'adhésion introuvable");
    }

    if (request.salon.ownerId !== ownerId) {
        throw new Error("Seul le propriétaire du salon peut refuser cette demande");
    }

    if (request.status !== SalonMembershipRequestStatus.PENDING) {
        throw new Error("Cette demande a déjà été traitée");
    }

    return prisma.salonMembershipRequest.update({
        where: { id: requestId },
        data: {
            status: SalonMembershipRequestStatus.REJECTED,
        },
        include: {
            salon: true,
            requester: {
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