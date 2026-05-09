import { Prisma, SalonInvitationStatus, SalonVisibility } from "@prisma/client";
import { prisma } from "../../lib/prisma";

export async function inviteToSalon({salonId, senderId, receiverId,}: {
    salonId: string;
    senderId: string;
    receiverId: string;
}) {
    if (senderId === receiverId) {
        throw new Error("Tu ne peux pas t'inviter toi-même.");
    }

    const salon = await prisma.salon.findUnique({
        where: { id: salonId },
    });

    if (!salon) {
        throw new Error("Salon introuvable.");
    }

    if (salon.ownerId !== senderId) {
        throw new Error("Seul le propriétaire du salon peut inviter.");
    }

    if (salon.visibility !== SalonVisibility.PRIVATE) {
        throw new Error("Les invitations concernent seulement les salons privés.");
    }

    const receiver = await prisma.user.findUnique({
        where: { id: receiverId },
    });

    if (!receiver) {
        throw new Error("Utilisateur introuvable.");
    }

    const friendship = await prisma.friendship.findFirst({
        where: {
            status: "ACCEPTED",
            OR: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId },
            ],
        },
    });

    if (!friendship) {
        throw new Error("Tu peux inviter seulement tes amis.");
    }

    const alreadyMember = await prisma.salonMember.findUnique({
        where: {
            userId_salonId: {
                userId: receiverId,
                salonId,
            },
        },
    });

    if (alreadyMember) {
        throw new Error("Cet utilisateur est déjà membre du salon.");
    }

    const existingPendingInvitation = await prisma.salonInvitation.findFirst({
        where: {
            salonId,
            receiverId,
            status: SalonInvitationStatus.PENDING,
        },
    });

    if (existingPendingInvitation) {
        throw new Error("Une invitation est déjà en attente.");
    }

    return prisma.salonInvitation.create({
        data: {
            salonId,
            senderId,
            receiverId,
        },
        include: {
            salon: true,
            sender: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                },
            },
            receiver: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                },
            },
        },
    });
}

export async function getMySalonInvitations(userId: string) {
    return prisma.salonInvitation.findMany({
        where: {
            receiverId: userId,
            status: SalonInvitationStatus.PENDING,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            salon: true,
            sender: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                },
            },
        },
    });
}

export async function acceptSalonInvitation(invitationId: string, userId: string) {
    const invitation = await prisma.salonInvitation.findUnique({
        where: { id: invitationId },
    });

    if (!invitation) {
        throw new Error("Invitation introuvable.");
    }

    if (invitation.receiverId !== userId) {
        throw new Error("Tu ne peux pas accepter cette invitation.");
    }

    if (invitation.status !== SalonInvitationStatus.PENDING) {
        throw new Error("Cette invitation n'est plus en attente.");
    }

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.salonMember.upsert({
            where: {
                userId_salonId: {
                    userId,
                    salonId: invitation.salonId,
                },
            },
            update: {},
            create: {
                userId,
                salonId: invitation.salonId,
            },
        });

        return tx.salonInvitation.update({
            where: { id: invitationId },
            data: {
                status: SalonInvitationStatus.ACCEPTED,
            },
            include: {
                salon: true,
                sender: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
    });
}

export async function rejectSalonInvitation(invitationId: string, userId: string) {
    const invitation = await prisma.salonInvitation.findUnique({
        where: { id: invitationId },
    });

    if (!invitation) {
        throw new Error("Invitation introuvable.");
    }

    if (invitation.receiverId !== userId) {
        throw new Error("Tu ne peux pas refuser cette invitation.");
    }

    if (invitation.status !== SalonInvitationStatus.PENDING) {
        throw new Error("Cette invitation n'est plus en attente.");
    }

    return prisma.salonInvitation.update({
        where: { id: invitationId },
        data: {
            status: SalonInvitationStatus.REJECTED,
        },
        include: {
            salon: true,
            sender: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                },
            },
        },
    });
}