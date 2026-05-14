import type { Request, Response, NextFunction } from "express";
import { inviteToSalonSchema } from "./salonInvitation.schema";
import {
    acceptSalonInvitation,
    getMySalonInvitations,
    inviteToSalon,
    rejectSalonInvitation,
} from "./salonInvitation.service";
import { getStringParam } from "../../utils/params";
import { getIO } from "../../lib/socket";

export async function inviteToSalonHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.userId;
        const salonId = getStringParam(req.params.id, "salonId");

        const data = inviteToSalonSchema.parse(req.body);

        const invitation = await inviteToSalon({
            salonId,
            senderId: userId,
            receiverId: data.receiverId,
        });

        getIO()
            .to(`user:${data.receiverId}`)
            .emit("salon_invitation_received", {
                message: "Nouvelle invitation salon",
                invitation,
            });

        return res.status(201).json({ invitation });
    } catch (error) {
        next(error);
    }
}

export async function getMySalonInvitationsHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.userId;
        const invitations = await getMySalonInvitations(userId);

        return res.status(200).json({ invitations });
    } catch (error) {
        next(error);
    }
}

export async function acceptSalonInvitationHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.userId;
        const invitationId = getStringParam(req.params.id, "invitationId");

        const invitation = await acceptSalonInvitation(invitationId, userId);

        return res.status(200).json({ invitation });
    } catch (error) {
        next(error);
    }
}

export async function rejectSalonInvitationHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.userId;
        const invitationId = getStringParam(req.params.id, "invitationId");

        const invitation = await rejectSalonInvitation(invitationId, userId);

        return res.status(200).json({ invitation });
    } catch (error) {
        next(error);
    }
}