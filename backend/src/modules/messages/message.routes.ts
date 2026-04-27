import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
    createMessageHandler,
    deleteMessageHandler,
    getMessages,
} from "./message.controller";

const messageRouter = Router();

messageRouter.get("/salon/:salonId", getMessages);
messageRouter.post("/", authenticate, createMessageHandler);
messageRouter.delete("/:id", authenticate, deleteMessageHandler);

export { messageRouter };