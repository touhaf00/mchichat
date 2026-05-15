import { api } from "../../lib/api";

export type PostAuthor = {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
};

export type PostComment = {
    id: string;
    content: string;
    postId: string;
    authorId: string;
    createdAt: string;
    updatedAt: string;
    author: PostAuthor;
};

export type FeedPost = {
    id: string;
    content: string;
    mediaUrl?: string | null;
    mediaType?: string | null;
    authorId: string;
    createdAt: string;
    updatedAt: string;
    author: PostAuthor;
    comments: PostComment[];
    likesCount: number;
    commentsCount: number;
    isLikedByMe: boolean;
};

export async function getPostsRequest() {
    const response = await api.get<{ posts: FeedPost[] }>("/posts");
    return response.data;
}

export async function createPostRequest(payload: {
    content?: string;
    media?: File | null;
}) {
    const formData = new FormData();

    if (payload.content?.trim()) {
        formData.append("content", payload.content.trim());
    }

    if (payload.media) {
        formData.append("media", payload.media);
    }

    const response = await api.post<{ message: string; post: FeedPost }>(
        "/posts",
        formData
    );

    return response.data;
}

export async function updatePostRequest(
    id: string,
    payload: {
        content?: string;
        media?: File | null;
    }
) {
    const formData = new FormData();

    if (payload.content !== undefined) {
        formData.append("content", payload.content);
    }

    if (payload.media) {
        formData.append("media", payload.media);
    }

    const response = await api.put<{ message: string; post: FeedPost }>(
        `/posts/${id}`,
        formData
    );

    return response.data;
}

export async function deletePostRequest(id: string) {
    const response = await api.delete<{ message: string }>(`/posts/${id}`);
    return response.data;
}

export async function togglePostLikeRequest(id: string) {
    const response = await api.post<{ post: FeedPost }>(`/posts/${id}/like`);
    return response.data;
}

export async function createPostCommentRequest(id: string, content: string) {
    const response = await api.post<{ message: string; comment: PostComment }>(
        `/posts/${id}/comments`,
        { content }
    );

    return response.data;
}