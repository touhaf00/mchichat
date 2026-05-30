import axios from "axios";
import { env } from "./env";
import { getSessionAccessToken, setSessionAccessToken } from "./storage";

let accessTokenMemory: string | null = getSessionAccessToken();

export const api = axios.create({
    baseURL: env.apiBaseUrl,
    withCredentials: true,
});

export function setAccessToken(token: string | null) {
    accessTokenMemory = token;
    setSessionAccessToken(token);

    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common.Authorization;
    }
}

if (accessTokenMemory) {
    api.defaults.headers.common.Authorization = `Bearer ${accessTokenMemory}`;
}

api.interceptors.request.use((config) => {
    if (accessTokenMemory) {
        config.headers.Authorization = `Bearer ${accessTokenMemory}`;
    }

    return config;
});