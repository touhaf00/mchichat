import { api } from "../../lib/api";

export type AuthUser = {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
    createdAt: string;
    updatedAt?: string;
};

export type AuthResponse = {
    message: string;
    user: AuthUser;
    token: string;
};

export type RegisterPayload = {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
};

export type LoginPayload = {
    email: string;
    password: string;
};

export async function registerRequest(payload: RegisterPayload) {
    const response = await api.post<AuthResponse>("/auth/register", payload);
    return response.data;
}

export async function loginRequest(payload: LoginPayload) {
    const response = await api.post<AuthResponse>("/auth/login", payload);
    return response.data;
}

export async function meRequest() {
    const response = await api.get<{ user: AuthUser }>("/auth/me");
    return response.data;
}