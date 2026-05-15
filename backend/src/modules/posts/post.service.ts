import { prisma } from "../../lib/prisma";
import type { CreateCommentInput } from "./post.schema";

type PostWithRelations = {
    likes: { userId: string }[];
    comments: unknown[];
};

type CreatePostData = {
    content: string;
    mediaUrl?: string | null;
    mediaType?: string | null;
};

type UpdatePostData = {
    content: string;
    mediaUrl?: string;
    mediaType?: string;
};

function postInclude() {
    return {
        author: {
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
            },
        },
        likes: {
            select: {
                userId: true,
            },
        },
        comments: {
            orderBy: {
                createdAt: "asc" as const,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        },
    };
}

function formatPost<TPost extends PostWithRelations>(
    post: TPost,
    userId: string
) {
    return {
        ...post,
        likesCount: post.likes.length,
        commentsCount: post.comments.length,
        isLikedByMe: post.likes.some((like) => like.userId === userId),
    };
}

export async function getPosts(userId: string) {
    const posts = await prisma.post.findMany({
        orderBy: {
            createdAt: "desc",
        },
        include: postInclude(),
    });

    return posts.map((post) => formatPost(post, userId));
}

export async function createPost(userId: string, data: CreatePostData) {
    const post = await prisma.post.create({
        data: {
            content: data.content || "",
            mediaUrl: data.mediaUrl ?? null,
            mediaType: data.mediaType ?? null,
            authorId: userId,
        },
        include: postInclude(),
    });

    return formatPost(post, userId);
}

export async function updatePost(
    postId: string,
    userId: string,
    data: UpdatePostData
) {
    const post = await prisma.post.findUnique({
        where: { id: postId },
    });

    if (!post) {
        throw new Error("Post introuvable");
    }

    if (post.authorId !== userId) {
        throw new Error("Tu n'es pas autorisé à modifier ce post");
    }

    const nextContent = data.content ?? post.content;
    const nextMediaUrl = data.mediaUrl ?? post.mediaUrl;

    if (!nextContent.trim() && !nextMediaUrl) {
        throw new Error("Le post doit contenir du texte ou un média");
    }

    const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
            content: nextContent,
            ...(data.mediaUrl
                ? {
                    mediaUrl: data.mediaUrl,
                    mediaType: data.mediaType,
                }
                : {}),
        },
        include: postInclude(),
    });

    return formatPost(updatedPost, userId);
}

export async function deletePost(postId: string, userId: string) {
    const post = await prisma.post.findUnique({
        where: { id: postId },
    });

    if (!post) {
        throw new Error("Post introuvable");
    }

    if (post.authorId !== userId) {
        throw new Error("Tu n'es pas autorisé à supprimer ce post");
    }

    await prisma.post.delete({
        where: { id: postId },
    });

    return {
        message: "Post supprimé avec succès",
    };
}

export async function togglePostLike(postId: string, userId: string) {
    const post = await prisma.post.findUnique({
        where: { id: postId },
    });

    if (!post) {
        throw new Error("Post introuvable");
    }

    const existingLike = await prisma.postLike.findUnique({
        where: {
            postId_userId: {
                postId,
                userId,
            },
        },
    });

    if (existingLike) {
        await prisma.postLike.delete({
            where: {
                postId_userId: {
                    postId,
                    userId,
                },
            },
        });
    } else {
        await prisma.postLike.create({
            data: {
                postId,
                userId,
            },
        });
    }

    const updatedPost = await prisma.post.findUniqueOrThrow({
        where: { id: postId },
        include: postInclude(),
    });

    return formatPost(updatedPost, userId);
}

export async function createPostComment(
    postId: string,
    userId: string,
    data: CreateCommentInput
) {
    const post = await prisma.post.findUnique({
        where: { id: postId },
    });

    if (!post) {
        throw new Error("Post introuvable");
    }

    return prisma.postComment.create({
        data: {
            postId,
            authorId: userId,
            content: data.content,
        },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                },
            },
        },
    });
}