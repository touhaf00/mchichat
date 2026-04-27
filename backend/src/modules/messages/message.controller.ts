import { Request, Response, NextFunction } from "express";
import { createMessageSchema } from "./message.schema";
import {
    createMessage,
    deleteMessage,
    getMessagesBySalon,
} from "./message.service";

export async function getMessages(req: Request, res: Response, next: NextFunction) {
    try {
        const messages = await getMessagesBySalon(req.params.salonId);

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

        const result = await deleteMessage(req.params.id, userId);

        res.json(result);
    } catch (err) {
        next(err);
    }
}