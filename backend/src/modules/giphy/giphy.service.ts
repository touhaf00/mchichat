import { env } from "../../config/env";

type GiphyApiGif = {
    id: string;
    title: string;
    url: string;
    images: {
        fixed_height?: {
            url: string;
        };
        original?: {
            url: string;
        };
    };
};

export async function searchGifs(query: string) {
    const url = new URL("https://api.giphy.com/v1/gifs/search");

    url.searchParams.set("api_key", env.GIPHY_API_KEY);
    url.searchParams.set("q", query);
    url.searchParams.set("rating", "pg");

    const response = await fetch(url);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur Giphy API: ${response.status} - ${errorText}`);
    }

    const result = (await response.json()) as { data: GiphyApiGif[] };

    return result.data.map((gif) => ({
        id: gif.id,
        title: gif.title,
        url: gif.url,
        imageUrl: gif.images.fixed_height?.url || gif.images.original?.url,
    }));
}