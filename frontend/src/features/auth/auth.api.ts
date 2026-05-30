import { api } from "../../lib/api";
import type { User } from "./auth.types";

type AuthResponse = {
    message: string;
    user: User;
    accessToken: string;
};

export async function loginRequest(payload: {
    email: string;
    password: string;
}) {
    const response = await api.post<AuthResponse>("/auth/login", payload);
    return response.data;
}

export async function registerRequest(payload: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
}) {
    const response = await api.post<AuthResponse>("/auth/register", payload);
    return response.data;
}

export async function getMeRequest() {
    const response = await api.get<{ user: User }>("/auth/me");
    return response.data;
}