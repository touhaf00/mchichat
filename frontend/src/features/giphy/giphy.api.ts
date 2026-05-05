import { api } from "../../lib/api"

export  type GifResult = {
    id: string,
    title: string,
    url: string,
    imageUrl?: string,
};

export async function searchGifsRequest(query: string) {
    const response = await api.get<{ gifs: GifResult[]}>("/giphy/search",
        { params: { q: query,
            },
        });

    return response.data;
}