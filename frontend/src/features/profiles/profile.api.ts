import { api } from "../../lib/api";

export type ProfileUser = {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    bio?: string | null;
    avatarUrl?: string | null;
    bannerUrl?: string | null;
    role: string;
    createdAt: string;
    _count?: {
        posts: number;
        memberships: number;
        ownedSalons: number;
    };
};

export type ProfilePostAuthor = {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
};

export type ProfilePostComment = {
    id: string;
    content?: string | null;
    gifUrl?: string | null;
    createdAt: string;
    author: ProfilePostAuthor;
};

export type ProfilePost = {
    id: string;
    content: string;
    mediaUrl?: string | null;
    mediaType?: string | null;
    authorId: string;
    createdAt: string;
    updatedAt: string;
    author: ProfilePostAuthor;
    comments: ProfilePostComment[];
    likes: { userId: string }[];
    likesCount: number;
    commentsCount: number;
    isLikedByMe: boolean;
};

export type ProfileResponse = {
    user: ProfileUser;
    posts: ProfilePost[];
    friendshipStatus:
        | "NONE"
        | "PENDING_SENT"
        | "PENDING_RECEIVED"
        | "FRIENDS"
        | "ME";
};

export type UpdateProfilePayload = {
    firstName?: string;
    lastName?: string;
    username?: string;
    bio?: string;
    avatar?: File | null;
    banner?: File | null;
};

export async function getProfileRequest(username: string) {
    const response = await api.get<ProfileResponse>(`/profiles/${username}`);
    return response.data;
}

export async function updateMyProfileRequest(payload: UpdateProfilePayload) {
    const formData = new FormData();

    if (payload.firstName !== undefined) {
        formData.append("firstName", payload.firstName);
    }

    if (payload.lastName !== undefined) {
        formData.append("lastName", payload.lastName);
    }

    if (payload.username !== undefined) {
        formData.append("username", payload.username);
    }

    if (payload.bio !== undefined) {
        formData.append("bio", payload.bio);
    }

    if (payload.avatar) {
        formData.append("avatar", payload.avatar);
    }

    if (payload.banner) {
        formData.append("banner", payload.banner);
    }

    const response = await api.put<{
        message: string;
        user: ProfileUser;
    }>("/profiles/me/settings", formData);

    return response.data;
}