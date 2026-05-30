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

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/auth/login") &&
            !originalRequest.url?.includes("/auth/register") &&
            !originalRequest.url?.includes("/auth/refresh") &&
            !originalRequest.url?.includes("/auth/logout")
        ) {
            originalRequest._retry = true;

            try {
                const response = await api.post("/auth/refresh");
                const newAccessToken = response.data.accessToken;

                setAccessToken(newAccessToken);

                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                return api(originalRequest);
            } catch {
                setAccessToken(null);
            }
        }

        return Promise.reject(error);
    }
);