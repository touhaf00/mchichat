import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { uploadMessageAttachment } from "../../middlewares/messageUpload.middleware";
import {
    createPrivateConversationHandler,
    createPrivateMessageHandler,
    getPrivateConversationsHandler,
    getPrivateMessagesHandler,
} from "./privateMessage.controller";

const privateConversationRouter = Router();

privateConversationRouter.get(
    "/",
    authenticate,
    getPrivateConversationsHandler
);

privateConversationRouter.post(
    "/",
    authenticate,
    createPrivateConversationHandler
);

privateConversationRouter.get(
    "/:id/messages",
    authenticate,
    getPrivateMessagesHandler
);

privateConversationRouter.post(
    "/:id/messages",
    authenticate,
    uploadMessageAttachment.single("attachment"),
    createPrivateMessageHandler
);

export { privateConversationRouter };