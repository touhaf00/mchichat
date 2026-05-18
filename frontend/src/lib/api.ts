import axios from "axios";
import { env } from "./env";
import { getToken } from "./storage";

export const api = axios.create({
    baseURL: env.apiBaseUrl,
});

api.interceptors.request.use((config) => {
    const token = getToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});