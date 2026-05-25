import type { NextFunction, Request, Response } from "express";
import { getLatestNews } from "./news.service";

export async function getLatestNewsHandler(
    _req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const articles = await getLatestNews();

        return res.status(200).json({
            articles,
        });
    } catch (error) {
        next(error);
    }
}