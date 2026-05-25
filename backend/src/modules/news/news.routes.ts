import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { getLatestNewsHandler } from "./news.controller";

const newsRouter = Router();

newsRouter.get("/", authenticate, getLatestNewsHandler);

export { newsRouter };