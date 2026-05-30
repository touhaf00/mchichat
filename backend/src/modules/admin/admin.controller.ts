import type { NextFunction, Request, Response } from "express";
import { getStringParam } from "../../utils/params";
import {
    deleteUserByAdmin,
    getAdminStats,
    getAllUsers,
    updateUserRole,
} from "./admin.service";
import { updateUserRoleSchema } from "./admin.schema";

export async function getAdminStatsHandler(
    _req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const stats = await getAdminStats();

        return res.status(200).json({
            stats,
        });
    } catch (error) {
        next(error);
    }
}

export async function getAdminUsersHandler(
    _req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const users = await getAllUsers();

        return res.status(200).json({
            users,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateUserRoleHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const currentAdminId = req.user?.userId;

        if (!currentAdminId) {
            return res.status(401).json({
                message: "Non autorisé",
            });
        }

        const userId = getStringParam(req.params.userId, "userId");
        const data = updateUserRoleSchema.parse(req.body);

        const user = await updateUserRole(currentAdminId, userId, data);

        return res.status(200).json({
            message: "Rôle utilisateur mis à jour",
            user,
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteUserByAdminHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const currentAdminId = req.user?.userId;

        if (!currentAdminId) {
            return res.status(401).json({
                message: "Non autorisé",
            });
        }

        const userId = getStringParam(req.params.userId, "userId");

        const result = await deleteUserByAdmin(currentAdminId, userId);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}