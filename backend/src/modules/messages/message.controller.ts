import { Request, Response, NextFunction } from "express";
import { createMessageSchema } from "./message.schema";
import {
    createMessage,
    deleteMessage,
    getMessagesBySalon,
} from "./message.service";
import {getStringParam} from "../../utils/params";

export async function getMessages(req: Request, res: Response, next: NextFunction) {
    try {
        const salonId  = getStringParam(req.params.salonId, "Salon id");
        const messages = await getMessagesBySalon(salonId);

        res.json({ messages });
    } catch (err) {
        next(err);
    }
}

export async function createMessageHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: "Non autorisé" });

        const data = createMessageSchema.parse(req.body);

        const message = await createMessage(data, userId);

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