import { Request, Response, NextFunction } from "express";
import { createMessageSchema, updateMessageSchema } from "./message.schema";
import {
    createMessage,
    deleteMessage,
    getMessagesBySalon,
    updateMessage,
} from "./message.service";
import {getStringParam} from "../../utils/params";
import { getIO } from "../../lib/socket";
import { prisma } from "../../lib/prisma";


export async function getMessages(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.userId;
        const salonId = getStringParam(req.params.salonId, "salonId");

        const messages = await getMessagesBySalon(salonId, userId);
        res.json({ messages });
    } catch (err) {
        next(err);
    }
}

export async function createMessageHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.userId;

        const result = createMessageSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: "Données invalides",
            });
        }

        const message = await createMessage({
            salonId: result.data.salonId,
            authorId: userId,
            content: result.data.content,
        });

        getIO().to(`salon:${result.data.salonId}`).emit("salon_message_created", message);

        const salonMembers = await prisma.salonMember.findMany({
            where: {
                salonId: result.data.salonId,
                userId: {
                    not: userId,
                },
            },
            select: {
                userId: true,
            },
        });

        for (const member of salonMembers) {
            getIO()
                .to(`user:${member.userId}`)
                .emit("salon_message_notification", {
                    message: "Nouveau message dans un salon",
                    salonId: result.data.salonId,
                    salonMessage: message,
                });
        }


        res.status(201).json({ message });
    } catch (err) {
        next(err);
    }
}

export async function updateMessageHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const id = getStringParam(req.params.id, "Message id");
        const data = updateMessageSchema.parse(req.body);

        const message = await updateMessage(id, userId, data.content);

        getIO()
            .to(`salon:${message.salonId}`)
            .emit("salon_message_updated", message);

        return res.status(200).json({
            message: "Message modifié avec succès",
            updatedMessage: message,
        });
    } catch (err) {
        next(err);
    }
}

export async function deleteMessageHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: "Non autorisé" });

        const id = getStringParam(req.params.id, "Message id");
        const result = await deleteMessage(id, userId);

        res.json(result);
    } catch (err) {
        next(err);
    }
}