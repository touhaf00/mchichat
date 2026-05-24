import type { NextFunction, Request, Response } from "express";
import { getStringParam } from "../../utils/params";
import { getProfileByUsername, updateMyProfile } from "./profile.service";
import { updateProfileSchema } from "./profile.schema";

function getProfileFileUrls(files: Request["files"]) {
    const result: {
        avatarUrl?: string | null;
        bannerUrl?: string | null;
    } = {};

    if (!files || Array.isArray(files)) {
        return result;
    }

    const avatar = files.avatar?.[0];
    const banner = files.banner?.[0];

    if (avatar) {
        result.avatarUrl = `/uploads/profiles/${avatar.filename}`;
    }

    if (banner) {
        result.bannerUrl = `/uploads/profiles/${banner.filename}`;
    }

    return result;
}

export async function getProfileHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const username = getStringParam(req.params.username, "Username");
        const currentUserId = req.user?.userId;

        const profile = await getProfileByUsername(username, currentUserId);

        return res.status(200).json(profile);
    } catch (error) {
        next(error);
    }
}

export async function updateMyProfileHandler(
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

        const data = updateProfileSchema.parse({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username,
            bio: req.body.bio,
        });

        const files = getProfileFileUrls(req.files);
        const user = await updateMyProfile(userId, data, files);

        return res.status(200).json({
            message: "Profil mis à jour avec succès",
            user,
        });
    } catch (error) {
        next(error);
    }
}