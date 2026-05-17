import { api } from "../../lib/api";
import type { FeedPost } from "../feed/feed.api";

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
    updatedAt?: string;
};

export type PublicProfileResponse = {
    user: ProfileUser;
    posts: FeedPost[];
    friendshipStatus: "PENDING" | "ACCEPTED" | "REJECTED" | null;
    isMe: boolean;
};

export async function getProfileRequest(username: string) {
    const response = await api.get<PublicProfileResponse>(
        `/profiles/${username}`
    );

    return response.data;
}

export async function getMyProfileRequest() {
    const response = await api.get<{ user: ProfileUser }>("/profiles/me");
    return response.data;
}

export async function updateMyProfileRequest(payload: {
    firstName: string;
    lastName: string;
    username: string;
    bio?: string | null;
}) {
    const response = await api.put<{
        message: string;
        user: ProfileUser;
    }>("/profiles/me", payload);

    return response.data;
}

export async function updateAvatarRequest(file: File) {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await api.post<{
        message: string;
        user: Pick<ProfileUser, "id" | "avatarUrl">;
    }>("/profiles/me/avatar", formData);

    return response.data;
}

export async function updateBannerRequest(file: File) {
    const formData = new FormData();
    formData.append("banner", file);

    const response = await api.post<{
        message: string;
        user: Pick<ProfileUser, "id" | "bannerUrl">;
    }>("/profiles/me/banner", formData);

    return response.data;
}