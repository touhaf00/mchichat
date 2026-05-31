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
    updatePrivateMessage,
} from "./privateMessage.service";
import { getIO } from "../../lib/socket";
import fs from "fs";
import { convertAudioToMp3 } from "../../utils/convertAudio";
import {uploadToCloudinary} from "../../utils/uploadToCloudinary";
type UploadedAttachment = {
    attachmentUrl: string | null;
    attachmentType: string | null;
    attachmentName: string | null;
    attachmentSize: number | null;
};


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

        return res.status(200).json({
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

        return res.status(201).json({
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

        return res.status(200).json({
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

        const content =
            typeof req.body.content === "string" ? req.body.content.trim() : undefined;

        const gifUrl =
            typeof req.body.gifUrl === "string" ? req.body.gifUrl : undefined;

        let uploadedFile = req.file;

        if (uploadedFile?.mimetype.startsWith("audio/")) {
            const originalPath = uploadedFile.path;
            const converted = await convertAudioToMp3(originalPath);

            if (converted.outputPath !== originalPath) {
                fs.unlinkSync(originalPath);
            }

            uploadedFile = {
                ...uploadedFile,
                path: converted.outputPath,
                filename: converted.filename,
                originalname: converted.filename,
                mimetype: "audio/mpeg",
            };
        }

        let attachment: UploadedAttachment = {
            attachmentUrl: null,
            attachmentType: null,
            attachmentName: null,
            attachmentSize: null,
        };

        if (uploadedFile) {
            const uploaded = await uploadToCloudinary(
                uploadedFile,
                "mchichat/messages"
            );

            attachment = {
                attachmentUrl: uploaded.url,
                attachmentType: uploaded.type,
                attachmentName: uploaded.name,
                attachmentSize: uploaded.size,
            };
        }

        const data = createPrivateMessageSchema.parse({
            content,
            gifUrl,
            attachmentUrl: attachment.attachmentUrl,
        });

        if (!content && !gifUrl && !attachment.attachmentUrl) {
            return res.status(400).json({
                message: "Le message doit contenir du texte, un GIF ou un fichier",
            });
        }

        const message = await createPrivateMessage(id, userId, {
            content: data.content,
            gifUrl: data.gifUrl,
            attachmentUrl: attachment.attachmentUrl,
            attachmentType: attachment.attachmentType,
            attachmentName: attachment.attachmentName,
            attachmentSize: attachment.attachmentSize,
        });

        getIO()
            .to(`private:${id}`)
            .emit("private_message_created", message);

        const conversations = await getPrivateConversations(userId);
        const currentConversation = conversations.find((item) => item.id === id);

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

        return res.status(201).json({
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

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

export async function updatePrivateMessageHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const messageId = getStringParam(req.params.id, "Message id");
        const content = String(req.body.content || "").trim();

        const message = await updatePrivateMessage(messageId, userId, content);

        getIO()
            .to(`private:${message.conversationId}`)
            .emit("private_message_updated", message);

        return res.status(200).json({
            message: "Message modifié avec succès",
            updatedMessage: message,
        });
    } catch (err) {
        next(err);
    }
}