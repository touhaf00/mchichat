import type { Request, Response, NextFunction } from "express";
import { getStringParam } from "../../utils/params";
import { updateProfileSchema } from "./profile.schema";
import {
    getMyProfile,
    getProfileByUsername,
    updateAvatar,
    updateBanner,
    updateMyProfile,
} from "./profile.service";

function getUploadedProfileImage(file?: Express.Multer.File) {
    if (!file) {
        return null;
    }

    return `/uploads/profiles/${file.filename}`;
}

export async function getProfileHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const currentUserId = req.user?.userId;

        if (!currentUserId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const username = getStringParam(req.params.username, "Username");
        const profile = await getProfileByUsername(username, currentUserId);

        return res.status(200).json(profile);
    } catch (error) {
        next(error);
    }
}

export async function getMyProfileHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const user = await getMyProfile(userId);

        return res.status(200).json({ user });
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
            return res.status(401).json({ message: "Non autorisé" });
        }

        const data = updateProfileSchema.parse(req.body);
        const user = await updateMyProfile(userId, data);

        return res.status(200).json({
            message: "Profil mis à jour",
            user,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateAvatarHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const avatarUrl = getUploadedProfileImage(req.file);

        if (!avatarUrl) {
            return res.status(400).json({
                message: "Image d'avatar requise",
            });
        }

        const user = await updateAvatar(userId, avatarUrl);

        return res.status(200).json({
            message: "Avatar mis à jour",
            user,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateBannerHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const bannerUrl = getUploadedProfileImage(req.file);

        if (!bannerUrl) {
            return res.status(400).json({
                message: "Image de bannière requise",
            });
        }

        const user = await updateBanner(userId, bannerUrl);

        return res.status(200).json({
            message: "Bannière mise à jour",
            user,
        });
    } catch (error) {
        next(error);
    }
}