import { Request, Response, NextFunction } from "express";
import { createSalonSchema, updateSalonSchema } from "./salon.schema";
import {
    createSalon,
    deleteSalon,
    getAllSalons,
    getSalonById,
    updateSalon,
} from "./salon.service";
import  {getStringParam} from "../../utils/params";

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
        const id = getStringParam(req.params.id, "Salon id");
        const salon = await getSalonById(id);

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
        const id = getStringParam(req.params.id, "Salon id");
        const salon = await updateSalon(id, data, userId);

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
        const id = getStringParam(req.params.id, "Salon id");

        if (!id) {return res.status(400).json({message: "Salon id manquant",});}
        const result = await deleteSalon(id, userId);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}