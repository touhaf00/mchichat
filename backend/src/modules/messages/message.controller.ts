import { Request, Response, NextFunction } from "express";
import {createMessageSchema, updateMessageSchema} from "./message.schema";
import {
    createMessage,
    deleteMessage,
    getMessagesBySalon,
    updateMessage,
} from "./message.service";
import { getStringParam } from "../../utils/params";
import { getIO } from "../../lib/socket";
import { prisma } from "../../lib/prisma";
import fs from "fs";
import { convertAudioToMp3 } from "../../utils/convertAudio";

function getUploadedAttachment(file?: Express.Multer.File) {
    if (!file) {
        return {
            attachmentUrl: null,
            attachmentType: null,
            attachmentName: null,
            attachmentSize: null,
        };
    }

    let attachmentType = file.mimetype || "";
    const lowerName = file.originalname.toLowerCase();

    if (
        lowerName.endsWith(".webm") ||
        attachmentType.includes("webm")
    ) {
        attachmentType = "audio/webm";
    }

    else if (
        lowerName.endsWith(".m4a") ||
        lowerName.endsWith(".mp4") ||
        attachmentType.includes("mp4")
    ) {
        attachmentType = "audio/mp4";
    }

    else if (
        lowerName.endsWith(".aac") ||
        attachmentType.includes("aac")
    ) {
        attachmentType = "audio/aac";
    }

    else if (
        lowerName.endsWith(".ogg") ||
        attachmentType.includes("ogg")
    ) {
        attachmentType = "audio/ogg";
    }

    else if (
        lowerName.endsWith(".mp3") ||
        attachmentType.includes("mpeg")
    ) {
        attachmentType = "audio/mpeg";
    }

    if (
        attachmentType === "application/octet-stream" ||
        !attachmentType
    ) {
        if (lowerName.endsWith(".webm")) attachmentType = "audio/webm";
        if (lowerName.endsWith(".ogg")) attachmentType = "audio/ogg";
        if (lowerName.endsWith(".mp3")) attachmentType = "audio/mpeg";
        if (lowerName.endsWith(".wav")) attachmentType = "audio/wav";
        if (lowerName.endsWith(".m4a")) attachmentType = "audio/mp4";
    }

    return {
        attachmentUrl: `/uploads/messages/${file.filename}`,
        attachmentType,
        attachmentName: file.originalname,
        attachmentSize: file.size,
    };
}

export async function getMessages(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.userId;
        const salonId = getStringParam(req.params.salonId, "salonId");

        const messages = await getMessagesBySalon(salonId, userId);

        return res.status(200).json({ messages });
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
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const content =
            typeof req.body.content === "string" ? req.body.content.trim() : "";

        const salonId =
            typeof req.body.salonId === "string" ? req.body.salonId : "";

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

        const attachment = getUploadedAttachment(uploadedFile);

        const result = createMessageSchema.safeParse({
            salonId,
            content: content || undefined,
            attachmentUrl: attachment.attachmentUrl,
        });

        if (!result.success) {
            return res.status(400).json({
                message: "Données invalides",
                errors: result.error.issues,
            });
        }

        if (!content && !attachment.attachmentUrl) {
            return res.status(400).json({
                message: "Le message doit contenir du texte ou un fichier",
            });
        }

        const message = await createMessage({
            salonId: result.data.salonId,
            authorId: userId,
            content,
            attachmentUrl: attachment.attachmentUrl,
            attachmentType: attachment.attachmentType,
            attachmentName: attachment.attachmentName,
            attachmentSize: attachment.attachmentSize,
        });

        getIO()
            .to(`salon:${result.data.salonId}`)
            .emit("salon_message_created", message);

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

        return res.status(201).json({ message });
    } catch (err) {
        next(err);
    }
}

export async function deleteMessageHandler(
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
        const result = await deleteMessage(id, userId);

        return res.status(200).json(result);
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
