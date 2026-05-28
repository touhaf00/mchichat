import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
    deletePrivateMessageHandler,
    updatePrivateMessageHandler,
} from "./privateMessage.controller";

const privateMessageRouter = Router();

privateMessageRouter.patch(
    "/:id",
    authenticate,
    updatePrivateMessageHandler
);

privateMessageRouter.delete(
    "/:id",
    authenticate,
    deletePrivateMessageHandler
);

export { privateMessageRouter };