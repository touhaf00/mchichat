import { api } from "../../lib/api";

export type AdminStats = {
    usersCount: number;
    salonsCount: number;
    messagesCount: number;
    privateMessagesCount: number;
    postsCount: number;
    commentsCount: number;
};

export type AdminUser = {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    bio?: string | null;
    avatarUrl?: string | null;
    bannerUrl?: string | null;
    role: "USER" | "ADMIN";
    createdAt: string;
    updatedAt: string;
    _count?: {
        posts: number;
        messages: number;
        privateMessages: number;
        memberships: number;
    };
};

export async function getAdminStats() {
    const response = await api.get<{ stats: AdminStats }>("/admin/stats");
    return response.data;
}

export async function getAdminUsers() {
    const response = await api.get<{ users: AdminUser[] }>("/admin/users");
    return response.data;
}

export async function updateAdminUserRole(
    userId: string,
    role: "USER" | "ADMIN"
) {
    const response = await api.patch<{
        message: string;
        user: AdminUser;
    }>(`/admin/users/${userId}/role`, {
        role,
    });

    return response.data;
}

export async function deleteAdminUser(userId: string) {
    const response = await api.delete<{ message: string }>(
        `/admin/users/${userId}`
    );

    return response.data;
}