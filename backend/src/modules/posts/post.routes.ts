import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { uploadPostMedia } from "../../middlewares/upload.middleware";
import {
    createPostCommentHandler,
    createPostHandler,
    deletePostHandler,
    getPostsHandler,
    togglePostLikeHandler,
    updatePostHandler,
} from "./post.controller";

const postRouter = Router();

postRouter.get("/", authenticate, getPostsHandler);

postRouter.post(
    "/",
    authenticate,
    uploadPostMedia.single("media"),
    createPostHandler
);

postRouter.put(
    "/:id",
    authenticate,
    uploadPostMedia.single("media"),
    updatePostHandler
);

postRouter.delete("/:id", authenticate, deletePostHandler);

postRouter.post("/:id/like", authenticate, togglePostLikeHandler);

postRouter.post("/:id/comments", authenticate, createPostCommentHandler);

export { postRouter };