import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
    getFriendsHandler,
    getReceivedFriendRequestsHandler,
    getSentFriendRequestsHandler,
    respondToFriendRequestHandler,
    searchUsersHandler,
    sendFriendRequestHandler,
} from "./friend.controller";

const friendRouter = Router();

friendRouter.get("/search", authenticate, searchUsersHandler);
friendRouter.post("/requests", authenticate, sendFriendRequestHandler);
friendRouter.get("/requests/received", authenticate, getReceivedFriendRequestsHandler);
friendRouter.get("/requests/sent", authenticate, getSentFriendRequestsHandler);
friendRouter.patch("/requests/:id", authenticate, respondToFriendRequestHandler);
friendRouter.get("/", authenticate, getFriendsHandler);

export { friendRouter };