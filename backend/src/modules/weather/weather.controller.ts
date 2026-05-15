import type { Request, Response, NextFunction } from "express";

import { getCurrentWeather } from "./weather.service";

export async function getCurrentWeatherHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const latitude = Number(req.query.latitude);
        const longitude = Number(req.query.longitude);

        if (
            Number.isNaN(latitude) ||
            Number.isNaN(longitude)
        ) {
            return res.status(400).json({
                message: "Latitude ou longitude invalide",
            });
        }

        const weather = await getCurrentWeather(
            latitude,
            longitude
        );

        return res.status(200).json({
            weather,
        });
    } catch (error) {
        next(error);
    }
}