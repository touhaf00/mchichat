import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
    createMessageHandler,
    deleteMessageHandler,
    getMessages,
    updateMessageHandler,
} from "./message.controller";

const messageRouter = Router();

messageRouter.get("/salon/:salonId", authenticate, getMessages);
messageRouter.post("/", authenticate, createMessageHandler);
messageRouter.put("/:id", authenticate, updateMessageHandler);
messageRouter.delete("/:id", authenticate, deleteMessageHandler);

export { messageRouter };