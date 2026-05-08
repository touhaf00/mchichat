import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
    createPrivateConversationHandler,
    createPrivateMessageHandler,
    deletePrivateMessageHandler,
    getPrivateConversationsHandler,
    getPrivateMessagesHandler,
} from "./privateMessage.controller";

const privateMessageRouter = Router();

privateMessageRouter.get(
    "/private-conversations",
    authenticate,
    getPrivateConversationsHandler
);

privateMessageRouter.post(
    "/private-conversations",
    authenticate,
    createPrivateConversationHandler
);

privateMessageRouter.get(
    "/private-conversations/:id/messages",
    authenticate,
    getPrivateMessagesHandler
);

privateMessageRouter.post(
    "/private-conversations/:id/messages",
    authenticate,
    createPrivateMessageHandler
);

privateMessageRouter.delete(
    "/private-messages/:id",
    authenticate,
    deletePrivateMessageHandler
);

export { privateMessageRouter };