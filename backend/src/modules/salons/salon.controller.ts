import { Request, Response, NextFunction } from "express";
import { createSalonSchema, updateSalonSchema } from "./salon.schema";
import {
    createSalon,
    deleteSalon,
    getAllSalons,
    getSalonById,
    updateSalon,
} from "./salon.service";

export async function getSalons(
    _req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const salons = await getAllSalons();

        res.status(200).json({
            salons,
        });
    } catch (error) {
        next(error);
    }
}

export async function getSalon(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const salon = await getSalonById(req.params.id);

        res.status(200).json({
            salon,
        });
    } catch (error) {
        next(error);
    }
}

export async function createSalonHandler(
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

        const data = createSalonSchema.parse(req.body);
        const salon = await createSalon(data, userId);

        res.status(201).json({
            message: "Salon créé avec succès",
            salon,
        });
    } catch (error) {
        next(error);
    }
}

export async function updateSalonHandler(
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

        const data = updateSalonSchema.parse(req.body);
        const salon = await updateSalon(req.params.id, data, userId);

        res.status(200).json({
            message: "Salon mis à jour avec succès",
            salon,
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteSalonHandler(
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

        const result = await deleteSalon(req.params.id, userId);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}