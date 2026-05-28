import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
    createMessageHandler,
    deleteMessageHandler,
    getMessages,
    updateMessageHandler,
} from "./message.controller";
import { uploadMessageAttachment } from "../../middlewares/messageUpload.middleware";


const messageRouter = Router();

messageRouter.get("/salon/:salonId", authenticate, getMessages);
messageRouter.post("/", authenticate, uploadMessageAttachment.single("attachment"), createMessageHandler);
messageRouter.put("/:id", authenticate, updateMessageHandler);
messageRouter.delete("/:id", authenticate, deleteMessageHandler);
messageRouter.patch("/:id", authenticate, updateMessageHandler);
export { messageRouter };