import { Request, Response, NextFunction } from "express";
import { getStringParam } from "../../utils/params";
import {
    searchUserSchema,
    sendFriendRequestSchema,
    updateFriendRequestSchema,
} from "./friend.schema";
import {
    getFriends,
    getReceivedFriendRequests,
    getSentFriendRequests,
    respondToFriendRequest,
    searchUsersByUsername,
    sendFriendRequest,
} from "./friend.service";

export async function searchUsersHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const username = getStringParam(req.query.username, "Username");
        const data = searchUserSchema.parse({ username });

        const users = await searchUsersByUsername(data.username, userId);

        res.status(200).json({ users });
    } catch (error) {
        next(error);
    }
}

export async function sendFriendRequestHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const data = sendFriendRequestSchema.parse(req.body);
        const friendRequest = await sendFriendRequest(userId, data);

        res.status(201).json({
            message: "Demande d'amitié envoyée",
            friendRequest,
        });
    } catch (error) {
        next(error);
    }
}

export async function getReceivedFriendRequestsHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const requests = await getReceivedFriendRequests(userId);

        res.status(200).json({ requests });
    } catch (error) {
        next(error);
    }
}

export async function getSentFriendRequestsHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const requests = await getSentFriendRequests(userId);

        res.status(200).json({ requests });
    } catch (error) {
        next(error);
    }
}

export async function respondToFriendRequestHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const id = getStringParam(req.params.id, "Friend request id");
        const data = updateFriendRequestSchema.parse(req.body);

        const friendRequest = await respondToFriendRequest(id, userId, data);

        res.status(200).json({
            message: "Demande d'amitié mise à jour",
            friendRequest,
        });
    } catch (error) {
        next(error);
    }
}

export async function getFriendsHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const friends = await getFriends(userId);

        res.status(200).json({ friends });
    } catch (error) {
        next(error);
    }
}