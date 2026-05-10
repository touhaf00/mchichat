import { Request, Response, NextFunction } from "express";
import { createMessageSchema } from "./message.schema";
import {
    createMessage,
    deleteMessage,
    getMessagesBySalon,
} from "./message.service";
import {getStringParam} from "../../utils/params";
import { getIO } from "../../lib/socket";

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

        res.status(201).json({ message });
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