import { env } from "./env";

const apiRootUrl = env.apiBaseUrl.replace(/\/api\/v1\/?$/, "");

export function getPublicFileUrl(url?: string | null) {
    if (!url) return "";

    if (url.startsWith("http")) {
        return url;
    }

    return `${apiRootUrl}${url}`;
}