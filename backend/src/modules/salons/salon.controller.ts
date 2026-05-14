import { Request, Response, NextFunction } from "express";
import { createSalonSchema, updateSalonSchema } from "./salon.schema";
import {
    createSalon,
    deleteSalon,
    getSalonById,
    getSalons as getSalonsService,
    updateSalon,
    acceptSalonMembershipRequest,
    getSalonMembershipRequests,
    rejectSalonMembershipRequest,
    requestSalonMembership,
} from "./salon.service";
import  {getStringParam} from "../../utils/params";
import {getIO} from "../../lib/socket";

export async function getSalons(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user!.userId;

        const salons = await getSalonsService(userId);

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
        const userId = req.user!.userId;
        const salonId = getStringParam(req.params.id, "salonId");

        const salon = await getSalonById(salonId, userId);
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

export async function requestSalonMembershipHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const salonId = getStringParam(req.params.id, "Salon id");

        const request = await requestSalonMembership(salonId, userId);

        getIO()
            .to(`user:${request.salon.ownerId}`)
            .emit("salon_membership_request_received", {
                message: "Nouvelle demande d'adhésion à un salon",
                request,
            });

        res.status(201).json({
            message: "Demande d'adhésion envoyée",
            request,
        });
    } catch (error) {
        next(error);
    }
}

export async function getSalonMembershipRequestsHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const requests = await getSalonMembershipRequests(userId);

        res.status(200).json({ requests });
    } catch (error) {
        next(error);
    }
}

export async function acceptSalonMembershipRequestHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const requestId = getStringParam(req.params.requestId, "Request id");

        const request = await acceptSalonMembershipRequest(requestId, userId);

        getIO()
            .to(`user:${request.requesterId}`)
            .emit("salon_membership_request_accepted", {
                message: "Ta demande d'adhésion au salon a été acceptée",
                request,
            });

        res.status(200).json({
            message: "Demande d'adhésion acceptée",
            request,
        });
    } catch (error) {
        next(error);
    }
}

export async function rejectSalonMembershipRequestHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const requestId = getStringParam(req.params.requestId, "Request id");

        const request = await rejectSalonMembershipRequest(requestId, userId);

        res.status(200).json({
            message: "Demande d'adhésion refusée",
            request,
        });
    } catch (error) {
        next(error);
    }
}