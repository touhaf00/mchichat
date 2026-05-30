import sanitizeHtml from "sanitize-html";

export function sanitizeString(value: string) {
    return sanitizeHtml(value, {
        allowedTags: [],
        allowedAttributes: {},
        disallowedTagsMode: "discard",
    }).trim();
}

export function sanitizeObject<T>(value: T): T {
    if (typeof value === "string") {
        return sanitizeString(value) as T;
    }

    if (Array.isArray(value)) {
        return value.map((item) => sanitizeObject(item)) as T;
    }

    if (value && typeof value === "object") {
        const cleaned: Record<string, unknown> = {};

        for (const [key, item] of Object.entries(value)) {
            cleaned[key] = sanitizeObject(item);
        }

        return cleaned as T;
    }

    return value;
}