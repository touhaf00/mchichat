import type { Request, Response } from "express";
import { inviteToSalonSchema } from "./salonInvitation.schema";
import {
    acceptSalonInvitation,
    getMySalonInvitations,
    inviteToSalon,
    rejectSalonInvitation,
} from "./salonInvitation.service";
import { getStringParam } from "../../utils/params";

export async function inviteToSalonHandler(req: Request, res: Response) {
    const userId = req.user!.userId;
    const salonId = getStringParam(req.params.id, "salonId");

    const result = inviteToSalonSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ message: "Données invalides" });
    }

    const invitation = await inviteToSalon({
        salonId,
        senderId: userId,
        receiverId: result.data.receiverId,
    });

    return res.status(201).json({ invitation });
}

export async function getMySalonInvitationsHandler(req: Request, res: Response) {
    const userId = req.user!.userId;

    const invitations = await getMySalonInvitations(userId);

    return res.json({ invitations });
}

export async function acceptSalonInvitationHandler(req: Request, res: Response) {
    const userId = req.user!.userId;
    const invitationId = getStringParam(req.params.id, "invitationId");

    const invitation = await acceptSalonInvitation(invitationId, userId);

    return res.json({ invitation });
}

export async function rejectSalonInvitationHandler(req: Request, res: Response) {
    const userId = req.user!.userId;
    const invitationId = getStringParam(req.params.id, "invitationId");

    const invitation = await rejectSalonInvitation(invitationId, userId);

    return res.json({ invitation });
}