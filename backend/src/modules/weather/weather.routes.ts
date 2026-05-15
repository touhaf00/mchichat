import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";

import { getCurrentWeatherHandler } from "./weather.controller";

const weatherRouter = Router();

weatherRouter.get(
    "/current",
    authenticate,
    getCurrentWeatherHandler
);

export { weatherRouter };