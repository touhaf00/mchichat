import { env } from "../../config/env";

type NewsDataArticle = {
    article_id: string;
    title: string;
    link: string;
    description?: string | null;
    pubDate?: string | null;
    image_url?: string | null;
    source_name?: string | null;
    category?: string[] | null;
    country?: string[] | null;
    language?: string | null;
};

type NewsDataResponse = {
    status: "success" | "error";
    results?: NewsDataArticle[];
    message?: string;
};

function formatArticles(data: NewsDataResponse) {
    return (data.results || []).map((article) => ({
        id: article.article_id,
        title: article.title,
        url: article.link,
        description: article.description,
        publishedAt: article.pubDate,
        imageUrl: article.image_url,
        sourceName: article.source_name,
        category: article.category,
        country: article.country,
        language: article.language,
    }));
}

async function fetchNews(params: Record<string, string>) {
    const url = new URL("https://newsdata.io/api/1/latest");

    url.searchParams.set("apikey", env.NEWSDATA_API_KEY);

    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Impossible de récupérer les actualités");
    }

    const data = (await response.json()) as NewsDataResponse;

    if (data.status === "error") {
        throw new Error(data.message || "Erreur NewsData.io");
    }

    return formatArticles(data);
}

export async function getLatestNews() {
    let articles = await fetchNews({
        language: "en",
    });

    articles = articles.filter(
        (article) =>
            article.title &&
            article.imageUrl &&
            article.description
    );

    if (articles.length > 0) {
        return articles;
    }

    return fetchNews({});
}