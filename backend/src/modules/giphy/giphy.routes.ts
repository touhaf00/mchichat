
import { Router } from 'express';
import { authenticate } from "../../middlewares/auth.middleware";
import { searchGifsHandler } from "./giphy.controller";

const giphyRouter = Router()

giphyRouter.get("/search", authenticate, searchGifsHandler);

export { giphyRouter };