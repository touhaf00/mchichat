import { Request, Response, NextFunction } from "express";
import { getStringParam } from "../../utils/params";
import {
    createPrivateConversationSchema,
    createPrivateMessageSchema,
} from "./privateMessage.schema";
import {
    createPrivateConversation,
    createPrivateMessage,
    deletePrivateMessage,
    getPrivateConversations,
    getPrivateMessages,
} from "./privateMessage.service";
import { getIO } from "../../lib/socket";

export async function getPrivateConversationsHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Non autorisé",
            });
        }

        const conversations = await getPrivateConversations(userId);

        res.status(200).json({
            conversations,
        });
    } catch (error) {
        next(error);
    }
}

export async function createPrivateConversationHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Non autorisé",
            });
        }

        const data = createPrivateConversationSchema.parse(req.body);
        const conversation = await createPrivateConversation(userId, data);

        res.status(201).json({
            message: "Conversation privée prête",
            conversation,
        });
    } catch (error) {
        next(error);
    }
}

export async function getPrivateMessagesHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Non autorisé",
            });
        }

        const id = getStringParam(req.params.id, "Conversation id");
        const messages = await getPrivateMessages(id, userId);

        res.status(200).json({
            messages,
        });
    } catch (error) {
        next(error);
    }
}

export async function createPrivateMessageHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Non autorisé",
            });
        }

        const id = getStringParam(req.params.id, "Conversation id");
        const data = createPrivateMessageSchema.parse(req.body);

        const message = await createPrivateMessage(id, userId, data);

        getIO()
            .to(`private:${id}`)
            .emit("private_message_created", message);

        const conversation = await getPrivateConversations(userId);
        const currentConversation = conversation.find((item) => item.id === id);

        const receiver = currentConversation?.participants.find(
            (participant) => participant.userId !== userId
        );

        if (receiver) {
            getIO()
                .to(`user:${receiver.userId}`)
                .emit("private_message_notification", {
                    message: "Nouveau message privé",
                    conversationId: id,
                    privateMessage: message,
                });
        }

        res.status(201).json({
            message,
        });
    } catch (error) {
        next(error);
    }
}

export async function deletePrivateMessageHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Non autorisé",
            });
        }

        const id = getStringParam(req.params.id, "Private message id");
        const result = await deletePrivateMessage(id, userId);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

