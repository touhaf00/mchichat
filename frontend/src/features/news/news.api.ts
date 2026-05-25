import { api } from "../../lib/api";

export type NewsArticle = {
    id: string;
    title: string;
    url: string;
    description?: string | null;
    publishedAt?: string | null;
    imageUrl?: string | null;
    sourceName?: string | null;
    category?: string[] | null;
    country?: string[] | null;
    language?: string | null;
};

export async function getLatestNewsRequest() {
    const response = await api.get<{ articles: NewsArticle[] }>("/news");
    return response.data;
}