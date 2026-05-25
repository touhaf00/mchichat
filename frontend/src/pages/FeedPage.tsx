import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import {
    createPostCommentRequest,
    createPostRequest,
    deletePostRequest,
    getPostsRequest,
    togglePostLikeRequest,
    updatePostRequest,
    type FeedPost,
} from "../features/feed/feed.api";
import { getWeatherRequest, type Weather } from "../features/weather/weather.api";
import { searchGifsRequest, type GifResult } from "../features/giphy/giphy.api";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";
import { getPublicFileUrl } from "../lib/media";
import { useNotifications } from "../features/notifications/NotificationProvider";
import { getLatestNewsRequest, type NewsArticle } from "../features/news/news.api";

function getWeatherLabel(code: number) {
    if (code === 0) return "Ciel dégagé";
    if ([1, 2, 3].includes(code)) return "Partiellement nuageux";
    if ([45, 48].includes(code)) return "Brouillard";
    if ([51, 53, 55, 61, 63, 65].includes(code)) return "Pluie";
    if ([71, 73, 75].includes(code)) return "Neige";
    if ([95, 96, 99].includes(code)) return "Orage";

    return "Météo variable";
}

export default function FeedPage() {
    const { user } = useAuth();
    const { showToast } = useNotifications();

    const [weather, setWeather] = useState<Weather | null>(null);
    const [posts, setPosts] = useState<FeedPost[]>([]);

    const [content, setContent] = useState("");
    const [media, setMedia] = useState<File | null>(null);
    const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);

    const [commentByPostId, setCommentByPostId] = useState<Record<string, string>>({});
    const [gifPickerPostId, setGifPickerPostId] = useState<string | null>(null);
    const [gifSearchByPostId, setGifSearchByPostId] = useState<Record<string, string>>({});
    const [gifsByPostId, setGifsByPostId] = useState<Record<string, GifResult[]>>({});
    const [selectedGifByPostId, setSelectedGifByPostId] = useState<
        Record<string, string | undefined>
    >({});

    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState("");
    const [editingMedia, setEditingMedia] = useState<File | null>(null);
    const [editingMediaPreviewUrl, setEditingMediaPreviewUrl] = useState<string | null>(null);

    const [isLoadingPosts, setIsLoadingPosts] = useState(true);
    const [isLoadingWeather, setIsLoadingWeather] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [error, setError] = useState("");

    const [news, setNews] = useState<NewsArticle[]>([]);
    const [isLoadingNews, setIsLoadingNews] = useState(true);

    function handleMediaChange(file: File | null) {
        setMedia(file);

        if (mediaPreviewUrl) {
            URL.revokeObjectURL(mediaPreviewUrl);
        }

        setMediaPreviewUrl(file ? URL.createObjectURL(file) : null);
    }

    function handleEditingMediaChange(file: File | null) {
        setEditingMedia(file);

        if (editingMediaPreviewUrl) {
            URL.revokeObjectURL(editingMediaPreviewUrl);
        }

        setEditingMediaPreviewUrl(file ? URL.createObjectURL(file) : null);
    }

    async function loadFeed() {
        try {
            setIsLoadingPosts(true);
            setError("");

            const postsData = await getPostsRequest();
            setPosts(postsData.posts);
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, "Erreur lors du chargement du fil"));
        } finally {
            setIsLoadingPosts(false);
        }
    }

    async function loadWeather() {
        if (!navigator.geolocation) {
            setIsLoadingWeather(false);
            showToast("La géolocalisation n'est pas disponible sur ce navigateur");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const data = await getWeatherRequest(
                        position.coords.latitude,
                        position.coords.longitude
                    );

                    setWeather(data.weather);
                } catch (err: unknown) {
                    showToast(getApiErrorMessage(err, "Erreur météo"));
                } finally {
                    setIsLoadingWeather(false);
                }
            },
            () => {
                setIsLoadingWeather(false);
                showToast("Impossible d'obtenir ta position pour la météo");
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
            }
        );
    }

    async function loadNews() {
        try {
            setIsLoadingNews(true);

            const data = await getLatestNewsRequest();
            setNews(data.articles);
        } catch (err: unknown) {
            showToast(getApiErrorMessage(err, "Erreur lors du chargement des actualités"));
        } finally {
            setIsLoadingNews(false);
        }
    }

    useEffect(() => {
        void loadFeed();
        void loadWeather();
        void loadNews();

        function refreshFeed() {
            void loadFeed();
        }

        window.addEventListener("feed:refresh", refreshFeed);

        return () => {
            window.removeEventListener("feed:refresh", refreshFeed);

            if (mediaPreviewUrl) {
                URL.revokeObjectURL(mediaPreviewUrl);
            }

            if (editingMediaPreviewUrl) {
                URL.revokeObjectURL(editingMediaPreviewUrl);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleCreatePost(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!content.trim() && !media) {
            showToast("Ajoute un texte ou un média avant de publier");
            return;
        }

        try {
            setIsPosting(true);

            const data = await createPostRequest({
                content: content.trim(),
                media,
            });

            setPosts((current) => [data.post, ...current]);
            setContent("");
            handleMediaChange(null);
            showToast("Post publié");
        } catch (err: unknown) {
            showToast(getApiErrorMessage(err, "Erreur lors de la publication"));
        } finally {
            setIsPosting(false);
        }
    }

    async function handleToggleLike(postId: string) {
        try {
            const data = await togglePostLikeRequest(postId);

            setPosts((current) =>
                current.map((post) => (post.id === postId ? data.post : post))
            );
        } catch (err: unknown) {
            showToast(getApiErrorMessage(err, "Erreur lors du like"));
        }
    }

    async function handleSearchCommentGifs(postId: string) {
        const query = gifSearchByPostId[postId]?.trim() || "funny";

        try {
            const data = await searchGifsRequest(query);

            setGifsByPostId((current) => ({
                ...current,
                [postId]: data.gifs,
            }));
        } catch (error: unknown) {
            showToast(getApiErrorMessage(error, "Erreur GIF"));
        }
    }

    function handleSelectCommentGif(postId: string, gifUrl: string) {
        setSelectedGifByPostId((current) => ({
            ...current,
            [postId]: gifUrl,
        }));
    }

    async function handleCreateComment(postId: string) {
        const commentContent = commentByPostId[postId]?.trim();
        const gifUrl = selectedGifByPostId[postId];

        if (!commentContent && !gifUrl) {
            showToast("Ajoute un commentaire ou un GIF");
            return;
        }

        try {
            const data = await createPostCommentRequest(postId, {
                content: commentContent,
                gifUrl,
            });

            setPosts((current) =>
                current.map((post) =>
                    post.id === postId
                        ? {
                            ...post,
                            comments: [...post.comments, data.comment],
                            commentsCount: post.commentsCount + 1,
                        }
                        : post
                )
            );

            setCommentByPostId((current) => ({
                ...current,
                [postId]: "",
            }));

            setSelectedGifByPostId((current) => ({
                ...current,
                [postId]: undefined,
            }));

            setGifsByPostId((current) => ({
                ...current,
                [postId]: [],
            }));

            setGifSearchByPostId((current) => ({
                ...current,
                [postId]: "",
            }));

            setGifPickerPostId(null);
        } catch (error: unknown) {
            showToast(getApiErrorMessage(error, "Erreur lors du commentaire"));
        }
    }

    async function handleDeletePost(postId: string) {
        try {
            await deletePostRequest(postId);
            setPosts((current) => current.filter((post) => post.id !== postId));
            showToast("Post supprimé");
        } catch (err: unknown) {
            showToast(getApiErrorMessage(err, "Erreur lors de la suppression"));
        }
    }

    function startEditing(post: FeedPost) {
        setEditingPostId(post.id);
        setEditingContent(post.content);
        handleEditingMediaChange(null);
    }

    function cancelEditing() {
        setEditingPostId(null);
        setEditingContent("");
        handleEditingMediaChange(null);
    }

    async function handleUpdatePost(postId: string) {
        if (!editingContent.trim() && !editingMedia) {
            showToast("Le post doit contenir du texte ou un média");
            return;
        }

        try {
            const data = await updatePostRequest(postId, {
                content: editingContent.trim(),
                media: editingMedia,
            });

            setPosts((current) =>
                current.map((post) => (post.id === postId ? data.post : post))
            );

            cancelEditing();
            showToast("Post modifié");
        } catch (err: unknown) {
            showToast(getApiErrorMessage(err, "Erreur lors de la modification"));
        }
    }

    if (isLoadingPosts) {
        return (
            <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
                Chargement du fil...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl bg-red-500/15 p-6 text-red-300">
                {error}
            </div>
        );
    }

    return (
        <section className="mx-auto max-w-3xl space-y-6">
            <div
                className="rounded-3xl border border-white/10 bg-gradient-to-br from-fuchsia-500/20 to-blue-500/10 p-6 shadow-2xl">
                {isLoadingWeather ? (
                    <p className="text-white/70">Chargement de la météo locale...</p>
                ) : weather ? (
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm uppercase tracking-wide text-white/50">
                                Météo locale
                            </p>

                            <h1 className="mt-1 text-3xl font-bold">{weather.city}</h1>

                            <p className="mt-1 text-sm text-white/50">
                                {weather.country}
                            </p>

                            <p className="mt-2 text-white/70">
                                {getWeatherLabel(weather.weatherCode)}
                            </p>

                            <p className="mt-1 text-sm text-white/50">
                                Ressenti {Math.round(weather.apparentTemperature)}° · Humidité{" "}
                                {weather.humidity}%
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-5xl font-extrabold text-fuchsia-300">
                                {Math.round(weather.temperature)}°
                            </p>

                            <p className="mt-2 text-sm text-white/60">
                                Vent {Math.round(weather.windSpeed)} km/h
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-white/70">
                        Météo indisponible. Autorise la localisation pour l'afficher.
                    </p>
                )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Actualités</h2>
                        <p className="mt-1 text-sm text-white/50">
                            Actualités du monde
                        </p>
                    </div>
                </div>

                {isLoadingNews ? (
                    <p className="text-white/60">Chargement des actualités...</p>
                ) : news.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {news.slice(0, 4).map((article) => (
                            <a
                                key={article.id}
                                href={article.url}
                                target="_blank"
                                rel="noreferrer"
                                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10"
                            >
                                {article.imageUrl && (
                                    <img
                                        src={article.imageUrl}
                                        alt={article.title}
                                        className="h-40 w-full object-cover"
                                    />
                                )}

                                <div className="p-4">
                                    <p className="text-xs uppercase tracking-wide text-white/40">
                                        {article.sourceName || "Actualité"}
                                    </p>

                                    <h3 className="mt-2 line-clamp-2 font-bold">
                                        {article.title}
                                    </h3>

                                    {article.description && (
                                        <p className="mt-2 line-clamp-3 text-sm text-white/60">
                                            {article.description}
                                        </p>
                                    )}

                                    {article.publishedAt && (
                                        <p className="mt-3 text-xs text-white/40">
                                            {new Date(article.publishedAt).toLocaleString("fr-FR")}
                                        </p>
                                    )}
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <p className="text-white/60">Aucune actualité disponible.</p>
                )}
            </div>

            <form
                onSubmit={handleCreatePost}
                className="rounded-3xl border border-white/10 bg-neutral-900 p-6"
            >
                <div className="mb-4 flex items-center gap-3">
                    <div
                        className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-fuchsia-500 font-bold">
                        {user?.firstName?.[0]}
                        {user?.lastName?.[0]}
                    </div>

                    <div>
                        {user?.username ? (
                            <Link
                                to={`/profile/${user.username}`}
                                className="font-semibold hover:text-fuchsia-300"
                            >
                                {user.firstName} {user.lastName}
                            </Link>
                        ) : (
                            <p className="font-semibold">
                                {user?.firstName} {user?.lastName}
                            </p>
                        )}

                        <p className="text-sm text-white/50">@{user?.username}</p>
                    </div>
                </div>

                <textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="Quoi de neuf sur Mchichat ?"
                    className="min-h-32 w-full resize-none rounded-2xl border border-white/10 bg-neutral-800 px-4 py-3 outline-none focus:border-fuchsia-400"
                />

                <label
                    className="mt-3 block cursor-pointer rounded-2xl border border-dashed border-white/20 bg-neutral-800 p-5 text-center transition hover:border-fuchsia-400 hover:bg-neutral-800/80">
                    <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(event) => {
                            handleMediaChange(event.target.files?.[0] || null);
                        }}
                    />

                    <p className="font-semibold text-white">
                        Ajouter une photo ou une vidéo
                    </p>

                    <p className="mt-1 text-sm text-white/50">
                        Clique ici pour choisir un média depuis ton appareil
                    </p>
                </label>

                {media && mediaPreviewUrl && (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-neutral-950 p-3">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-white">
                                    {media.name}
                                </p>

                                <p className="text-xs text-white/50">
                                    {(media.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleMediaChange(null)}
                                className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium hover:bg-red-600"
                            >
                                Retirer
                            </button>
                        </div>

                        {media.type.startsWith("image/") && (
                            <img
                                src={mediaPreviewUrl}
                                alt="Aperçu"
                                className="max-h-[420px] w-full rounded-xl object-cover"
                            />
                        )}

                        {media.type.startsWith("video/") && (
                            <video
                                src={mediaPreviewUrl}
                                controls
                                className="max-h-[420px] w-full rounded-xl object-cover"
                            />
                        )}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPosting || (!content.trim() && !media)}
                    className="mt-4 rounded-xl bg-fuchsia-500 px-5 py-3 font-semibold hover:bg-fuchsia-600 disabled:opacity-60"
                >
                    {isPosting ? "Publication..." : "Publier"}
                </button>
            </form>

            <div className="space-y-5">
                {posts.length > 0 ? (
                    posts.map((post) => {
                        const isOwner = post.authorId === user?.id;
                        const isEditing = editingPostId === post.id;

                        return (
                            <article
                                key={post.id}
                                className="rounded-3xl border border-white/10 bg-neutral-900 p-6"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white/10 font-bold">
                                            {post.author.avatarUrl ? (
                                                <img
                                                    src={getPublicFileUrl(post.author.avatarUrl)}
                                                    alt={post.author.username}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <>
                                                    {post.author.firstName[0]}
                                                    {post.author.lastName[0]}
                                                </>
                                            )}
                                        </div>

                                        <div>
                                            <Link
                                                to={`/profile/${post.author.username}`}
                                                className="font-semibold hover:text-fuchsia-300"
                                            >
                                                {post.author.firstName} {post.author.lastName}
                                            </Link>

                                            <p className="text-sm text-white/50">
                                                @{post.author.username} ·{" "}
                                                {new Date(post.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {isOwner && (
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => startEditing(post)}
                                                className="rounded-lg bg-blue-500 px-3 py-2 text-sm hover:bg-blue-600"
                                            >
                                                Modifier
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => void handleDeletePost(post.id)}
                                                className="rounded-lg bg-red-500 px-3 py-2 text-sm hover:bg-red-600"
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {isEditing ? (
                                    <div className="mt-4 space-y-3">
                                        <textarea
                                            value={editingContent}
                                            onChange={(event) =>
                                                setEditingContent(event.target.value)
                                            }
                                            className="min-h-28 w-full rounded-2xl border border-white/10 bg-neutral-800 px-4 py-3 outline-none focus:border-fuchsia-400"
                                        />

                                        <label
                                            className="block cursor-pointer rounded-2xl border border-dashed border-white/20 bg-neutral-800 p-4 text-center transition hover:border-fuchsia-400 hover:bg-neutral-800/80">
                                            <input
                                                type="file"
                                                accept="image/*,video/*"
                                                className="hidden"
                                                onChange={(event) => {
                                                    handleEditingMediaChange(
                                                        event.target.files?.[0] || null
                                                    );
                                                }}
                                            />

                                            <p className="text-sm font-semibold text-white">
                                                Remplacer le média
                                            </p>
                                        </label>

                                        {editingMedia && editingMediaPreviewUrl && (
                                            <div className="rounded-2xl border border-white/10 bg-neutral-950 p-3">
                                                <div className="mb-3 flex items-center justify-between gap-3">
                                                    <p className="text-sm text-white">
                                                        {editingMedia.name}
                                                    </p>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEditingMediaChange(null)
                                                        }
                                                        className="rounded-lg bg-red-500 px-3 py-2 text-sm hover:bg-red-600"
                                                    >
                                                        Retirer
                                                    </button>
                                                </div>

                                                {editingMedia.type.startsWith("image/") && (
                                                    <img
                                                        src={editingMediaPreviewUrl}
                                                        alt="Aperçu"
                                                        className="max-h-[420px] w-full rounded-xl object-cover"
                                                    />
                                                )}

                                                {editingMedia.type.startsWith("video/") && (
                                                    <video
                                                        src={editingMediaPreviewUrl}
                                                        controls
                                                        className="max-h-[420px] w-full rounded-xl object-cover"
                                                    />
                                                )}
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => void handleUpdatePost(post.id)}
                                                className="rounded-lg bg-green-500 px-4 py-2 text-sm hover:bg-green-600"
                                            >
                                                Enregistrer
                                            </button>

                                            <button
                                                type="button"
                                                onClick={cancelEditing}
                                                className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
                                            >
                                                Annuler
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    post.content && (
                                        <p className="mt-4 whitespace-pre-wrap text-white/90">
                                            {post.content}
                                        </p>
                                    )
                                )}

                                {post.mediaUrl && post.mediaType?.startsWith("image/") && (
                                    <img
                                        src={getPublicFileUrl(post.mediaUrl)}
                                        alt="Post"
                                        className="mt-4 max-h-[520px] w-full rounded-2xl object-cover"
                                    />
                                )}

                                {post.mediaUrl && post.mediaType?.startsWith("video/") && (
                                    <video
                                        src={getPublicFileUrl(post.mediaUrl)}
                                        controls
                                        className="mt-4 max-h-[520px] w-full rounded-2xl object-cover"
                                    />
                                )}

                                <div className="mt-5 flex items-center gap-3 border-y border-white/10 py-3">
                                    <button
                                        type="button"
                                        onClick={() => void handleToggleLike(post.id)}
                                        className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                                            post.isLikedByMe
                                                ? "bg-fuchsia-500 text-white"
                                                : "bg-white/10 hover:bg-white/20"
                                        }`}
                                    >
                                        {post.isLikedByMe ? "Aimé" : "J'aime"} ·{" "}
                                        {post.likesCount}
                                    </button>

                                    <span className="text-sm text-white/50">
                                        {post.commentsCount} commentaire
                                        {post.commentsCount > 1 ? "s" : ""}
                                    </span>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {post.comments.map((comment) => (
                                        <div
                                            key={comment.id}
                                            className="rounded-2xl bg-white/5 p-4"
                                        >
                                            <Link
                                                to={`/profile/${comment.author.username}`}
                                                className="text-sm font-semibold hover:text-fuchsia-300"
                                            >
                                                @{comment.author.username}
                                            </Link>

                                            {comment.content && (
                                                <p className="mt-1 text-white/80">
                                                    {comment.content}
                                                </p>
                                            )}

                                            {comment.gifUrl && (
                                                <img
                                                    src={comment.gifUrl}
                                                    alt="GIF"
                                                    className="mt-2 max-h-52 rounded-xl"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 space-y-3">
                                    <div className="flex gap-3">
                                        <input
                                            value={commentByPostId[post.id] || ""}
                                            onChange={(event) =>
                                                setCommentByPostId((current) => ({
                                                    ...current,
                                                    [post.id]: event.target.value,
                                                }))
                                            }
                                            placeholder="Écrire un commentaire..."
                                            className="flex-1 rounded-xl border border-white/10 bg-neutral-800 px-4 py-3 outline-none focus:border-fuchsia-400"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const nextValue =
                                                    gifPickerPostId === post.id
                                                        ? null
                                                        : post.id;

                                                setGifPickerPostId(nextValue);

                                                if (
                                                    nextValue === post.id &&
                                                    !gifsByPostId[post.id]?.length
                                                ) {
                                                    void handleSearchCommentGifs(post.id);
                                                }
                                            }}
                                            className="rounded-xl border border-white/10 bg-neutral-800 px-4 py-2 font-semibold hover:bg-neutral-700"
                                        >
                                            GIF
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => void handleCreateComment(post.id)}
                                            disabled={
                                                !commentByPostId[post.id]?.trim() &&
                                                !selectedGifByPostId[post.id]
                                            }
                                            className="rounded-xl bg-fuchsia-500 px-4 py-2 font-semibold hover:bg-fuchsia-600 disabled:opacity-60"
                                        >
                                            Envoyer
                                        </button>
                                    </div>

                                    {selectedGifByPostId[post.id] && (
                                        <div className="relative inline-block">
                                            <img
                                                src={selectedGifByPostId[post.id]}
                                                alt="GIF sélectionné"
                                                className="max-h-40 rounded-xl"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSelectedGifByPostId((current) => ({
                                                        ...current,
                                                        [post.id]: undefined,
                                                    }))
                                                }
                                                className="absolute right-2 top-2 rounded-lg bg-red-500 px-2 py-1 text-xs"
                                            >
                                                Retirer
                                            </button>
                                        </div>
                                    )}

                                    {gifPickerPostId === post.id && (
                                        <div className="rounded-2xl border border-white/10 bg-neutral-950 p-4">
                                            <div className="mb-4 flex items-center justify-between gap-3">
                                                <h3 className="font-semibold">
                                                    Choisir un GIF
                                                </h3>

                                                <button
                                                    type="button"
                                                    onClick={() => setGifPickerPostId(null)}
                                                    className="rounded-lg bg-white/10 px-3 py-1 text-sm hover:bg-white/20"
                                                >
                                                    Fermer
                                                </button>
                                            </div>

                                            <div className="mb-4 flex gap-3">
                                                <input
                                                    value={
                                                        gifSearchByPostId[post.id] || ""
                                                    }
                                                    onChange={(event) =>
                                                        setGifSearchByPostId(
                                                            (current) => ({
                                                                ...current,
                                                                [post.id]:
                                                                event.target.value,
                                                            })
                                                        )
                                                    }
                                                    onKeyDown={(event) => {
                                                        if (event.key === "Enter") {
                                                            event.preventDefault();
                                                            void handleSearchCommentGifs(
                                                                post.id
                                                            );
                                                        }
                                                    }}
                                                    placeholder="Rechercher un GIF..."
                                                    className="flex-1 rounded-lg border border-white/10 bg-neutral-800 px-4 py-2 outline-none focus:border-fuchsia-400"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void handleSearchCommentGifs(
                                                            post.id
                                                        )
                                                    }
                                                    className="rounded-lg bg-fuchsia-500 px-4 py-2 font-medium hover:bg-fuchsia-600"
                                                >
                                                    OK
                                                </button>
                                            </div>

                                            {gifsByPostId[post.id]?.length > 0 ? (
                                                <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto">
                                                    {gifsByPostId[post.id].map((gif) => (
                                                        <button
                                                            key={gif.id}
                                                            type="button"
                                                            onClick={() => {
                                                                if (gif.imageUrl) {
                                                                    handleSelectCommentGif(
                                                                        post.id,
                                                                        gif.imageUrl
                                                                    );
                                                                    setGifPickerPostId(null);
                                                                }
                                                            }}
                                                            className="overflow-hidden rounded-xl border border-white/10 hover:border-fuchsia-400"
                                                        >
                                                            {gif.imageUrl && (
                                                                <img
                                                                    src={gif.imageUrl}
                                                                    alt={
                                                                        gif.title ||
                                                                        "GIF"
                                                                    }
                                                                    className="h-28 w-full object-cover"
                                                                />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="py-4 text-center text-white/60">
                                                    Aucun GIF chargé.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </article>
                        );
                    })
                ) : (
                    <div className="rounded-3xl border border-white/10 bg-neutral-900 p-8 text-center text-white/60">
                        Aucun post pour le moment. Sois le premier à poster.
                    </div>
                )}
            </div>
        </section>
    );
}