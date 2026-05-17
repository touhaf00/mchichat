import type { Request, Response, NextFunction } from "express";
import { getStringParam } from "../../utils/params";
import { createCommentSchema, updatePostSchema } from "./post.schema";
import {
    createPost,
    createPostComment,
    deletePost,
    getPosts,
    togglePostLike,
    updatePost,
} from "./post.service";
import { getIO } from "../../lib/socket";

function getUploadedPostMedia(file?: Express.Multer.File) {
    if (!file) {
        return {
            mediaUrl: null,
            mediaType: null,
        };
    }

    return {
        mediaUrl: `/uploads/posts/${file.filename}`,
        mediaType: file.mimetype,
    };
}

export async function getPostsHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const posts = await getPosts(userId);

        return res.status(200).json({ posts });
    } catch (error) {
        next(error);
    }
}

export async function createPostHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const content =
            typeof req.body.content === "string" ? req.body.content.trim() : "";

        const media = getUploadedPostMedia(req.file);

        if (!content && !media.mediaUrl) {
            return res.status(400).json({
                message: "Le post doit contenir du texte ou un média",
            });
        }

        const post = await createPost(userId, {
            content,
            mediaUrl: media.mediaUrl,
            mediaType: media.mediaType,
        });

        return res.status(201).json({
            message: "Post créé avec succès",
            post,
        });
    } catch (error) {
        next(error);
    }
}

export async function updatePostHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const id = getStringParam(req.params.id, "Post id");

        const data = updatePostSchema.parse({
            content:
                typeof req.body.content === "string"
                    ? req.body.content.trim()
                    : undefined,
        });

        const media = req.file ? getUploadedPostMedia(req.file) : undefined;

        const post = await updatePost(id, userId, {
            content: data.content ?? "",
            ...(media
                ? {
                    mediaUrl: media.mediaUrl ?? undefined,
                    mediaType: media.mediaType ?? undefined,
                }
                : {}),
        });

        return res.status(200).json({
            message: "Post modifié avec succès",
            post,
        });
    } catch (error) {
        next(error);
    }
}

export async function deletePostHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const id = getStringParam(req.params.id, "Post id");
        const result = await deletePost(id, userId);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

export async function togglePostLikeHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const id = getStringParam(req.params.id, "Post id");
        const result = await togglePostLike(id, userId);

        if (result.liked && result.postAuthorId !== userId) {
            getIO()
                .to(`user:${result.postAuthorId}`)
                .emit("post_liked", {
                    message: "Quelqu'un a aimé ton post",
                    post: result.post,
                });
        }

        return res.status(200).json({
            post: result.post,
        });
    } catch (error) {
        next(error);
    }
}

export async function createPostCommentHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Non autorisé" });
        }

        const id = getStringParam(req.params.id, "Post id");
        const data = createCommentSchema.parse(req.body);

        const result = await createPostComment(id, userId, data);

        if (result.postAuthorId !== userId) {
            getIO()
                .to(`user:${result.postAuthorId}`)
                .emit("post_commented", {
                    message: "Quelqu'un a commenté ton post",
                    comment: result.comment,
                });
        }

        return res.status(201).json({
            message: "Commentaire ajouté",
            comment: result.comment,
        });
    } catch (error) {
        next(error);
    }
}