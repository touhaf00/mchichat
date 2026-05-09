import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    getSalonByIdRequest,
    type SalonDetails,
} from "../features/salons/salons.api";
import {
    getMessages,
    sendMessage,
} from "../features/messages/messages.api";
import {
    getFriendsRequest,
    type FriendUser,
} from "../features/friends/friends.api";
import { inviteToSalonRequest } from "../features/salon-invitations/salonInvitations.api";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";
import { searchGifsRequest, type GifResult } from "../features/giphy/giphy.api";
import { useAuth } from "../features/auth/useAuth";

type Message = {
    id: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    authorId: string;
    salonId: string;
    author?: {
        id: string;
        username: string;
        email?: string;
    };
};

export default function SalonPage() {
    const { id } = useParams();

    const { user } = useAuth();

    const [salon, setSalon] = useState<SalonDetails | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [content, setContent] = useState("");

    const [friends, setFriends] = useState<FriendUser[]>([]);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isLoadingFriends, setIsLoadingFriends] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [inviteMessage, setInviteMessage] = useState("");
    const [inviteError, setInviteError] = useState("");

    const [isLoadingSalon, setIsLoadingSalon] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const [isSending, setIsSending] = useState(false);

    const [error, setError] = useState("");
    const [messageError, setMessageError] = useState("");

    const [isGifPickerOpen, setIsGifPickerOpen] = useState(false);
    const [gifQuery, setGifQuery] = useState("");
    const [gifs, setGifs] = useState<GifResult[]>([]);
    const [isSearchingGifs, setIsSearchingGifs] = useState(false);

    const loadSalon = useCallback(async () => {
        if (!id) return;

        try {
            setIsLoadingSalon(true);
            setError("");

            const data = await getSalonByIdRequest(id);
            setSalon(data.salon);
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, "Erreur lors du chargement du salon"));
        } finally {
            setIsLoadingSalon(false);
        }
    }, [id]);

    const loadMessages = useCallback(async () => {
        if (!id) return;

        try {
            setIsLoadingMessages(true);
            setMessageError("");

            const data = await getMessages(id);
            setMessages(data.messages);
        } catch (err: unknown) {
            setMessageError(getApiErrorMessage(err, "Erreur lors du chargement des messages"));
        } finally {
            setIsLoadingMessages(false);
        }
    }, [id]);

    async function openInviteModal() {
        try {
            setIsLoadingFriends(true);
            setInviteError("");
            setInviteMessage("");

            const data = await getFriendsRequest();
            setFriends(data.friends);
            setIsInviteModalOpen(true);
        } catch (err: unknown) {
            setInviteError(getApiErrorMessage(err, "Erreur lors du chargement des amis"));
        } finally {
            setIsLoadingFriends(false);
        }
    }

    async function handleInviteFriend(receiverId: string) {
        if (!id) return;

        try {
            setIsInviting(true);
            setInviteError("");
            setInviteMessage("");

            await inviteToSalonRequest(id, receiverId);
            setInviteMessage("Invitation envoyée.");
        } catch (err: unknown) {
            setInviteError(getApiErrorMessage(err, "Erreur lors de l'envoi de l'invitation"));
        } finally {
            setIsInviting(false);
        }
    }

    async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!id) return;

        const trimmedContent = content.trim();

        if (!trimmedContent) {
            return;
        }

        try {
            setIsSending(true);
            setMessageError("");

            await sendMessage({
                salonId: id,
                content: trimmedContent,
            });

            setContent("");
            await loadMessages();
        } catch (err: unknown) {
            setMessageError(getApiErrorMessage(err, "Erreur lors de l'envoi du message"));
        } finally {
            setIsSending(false);
        }
    }

    async function handleSearchGifs() {
        const query = gifQuery.trim();

        if (!query) {
            await loadDefaultGifs();
            return;
        }

        try {
            setIsSearchingGifs(true);
            setMessageError("");

            const data = await searchGifsRequest(query);
            setGifs(data.gifs);
        } catch (err: unknown) {
            setMessageError(getApiErrorMessage(err, "Erreur lors de la recherche GIF"));
        } finally {
            setIsSearchingGifs(false);
        }
    }

    async function handleSendGif(gif: GifResult) {
        if (!id || !gif.imageUrl) return;

        try {
            setIsSending(true);
            setMessageError("");

            await sendMessage({
                salonId: id,
                content: gif.imageUrl,
            });

            setIsGifPickerOpen(false);
            setGifQuery("");
            await loadMessages();
        } catch (err: unknown) {
            setMessageError(getApiErrorMessage(err, "Erreur lors de l'envoi du Gif"));
        } finally {
            setIsSending(false);
        }
    }

    async function loadDefaultGifs() {
        try {
            setIsSearchingGifs(true);
            setMessageError("");

            const data = await searchGifsRequest("hello");
            setGifs(data.gifs);
        } catch (err: unknown) {
            setMessageError(getApiErrorMessage(err, "Erreur lors du chargement des GIFs"));
        } finally {
            setIsSearchingGifs(false);
        }
    }

    async function handleToggleGifPicker() {
        const nextValue = !isGifPickerOpen;

        setIsGifPickerOpen(nextValue);

        if (nextValue && gifs.length === 0) {
            await loadDefaultGifs();
        }
    }

    useEffect(() => {
        void loadSalon();
        void loadMessages();
    }, [loadSalon, loadMessages]);

    if (isLoadingSalon) {
        return <div>Chargement du salon...</div>;
    }

    if (error) {
        return (
            <div className="rounded-xl bg-red-500/15 p-4 text-red-300">
                {error}
            </div>
        );
    }

    if (!salon) {
        return <div>Salon introuvable.</div>;
    }

    const isOwner = user?.id === salon.ownerId;

    return (
        <section className="space-y-8">
            <Link to="/dashboard" className="text-fuchsia-400 hover:underline">
                ← Retour au dashboard
            </Link>

            {inviteMessage && (
                <div className="rounded-xl bg-green-500/15 p-4 text-green-300">
                    {inviteMessage}
                </div>
            )}

            {inviteError && (
                <div className="rounded-xl bg-red-500/15 p-4 text-red-300">
                    {inviteError}
                </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{salon.name}</h1>

                        <p className="mt-3 text-white/70">
                            {salon.description || "Pas de description"}
                        </p>

                        <div className="mt-4 text-sm text-white/50">
                            <p>Visibilité : {salon.visibility}</p>
                            <p>Propriétaire : {salon.owner?.username || "Inconnu"}</p>
                        </div>
                    </div>

                    {salon.visibility === "PRIVATE" && isOwner && (
                        <button
                            type="button"
                            onClick={() => void openInviteModal()}
                            disabled={isLoadingFriends}
                            className="rounded-lg bg-fuchsia-500 px-4 py-2 font-semibold hover:bg-fuchsia-600 disabled:opacity-60"
                        >
                            {isLoadingFriends ? "Chargement..." : "Inviter un ami"}
                        </button>
                    )}
                </div>
            </div>

            {isInviteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <h2 className="text-xl font-semibold">
                                Inviter un ami au salon
                            </h2>

                            <button
                                type="button"
                                onClick={() => setIsInviteModalOpen(false)}
                                className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
                            >
                                Fermer
                            </button>
                        </div>

                        {friends.length > 0 ? (
                            <div className="max-h-96 space-y-3 overflow-y-auto pr-2">
                                {friends.map((friend) => (
                                    <div
                                        key={friend.id}
                                        className="flex items-center justify-between gap-4 rounded-xl bg-white/5 p-4"
                                    >
                                        <div>
                                            <p className="font-semibold">@{friend.username}</p>
                                            <p className="text-sm text-white/60">
                                                {friend.firstName} {friend.lastName}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => void handleInviteFriend(friend.id)}
                                            disabled={isInviting}
                                            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium hover:bg-blue-600 disabled:opacity-60"
                                        >
                                            Inviter
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-white/60">
                                Aucun ami disponible à inviter.
                            </p>
                        )}
                    </div>
                </div>
            )}

            <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
                <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
                    <h2 className="mb-4 text-2xl font-semibold">Membres</h2>

                    {salon.members && salon.members.length > 0 ? (
                        <div className="space-y-3">
                            {salon.members.map((member) => (
                                <div key={member.id} className="rounded-lg bg-white/5 p-3">
                                    <p className="font-medium">
                                        {member.user?.username || "Inconnu"}
                                    </p>
                                    <p className="text-sm text-white/60">
                                        {member.user?.email}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white/60">Aucun membre.</p>
                    )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
                    <h2 className="mb-4 text-2xl font-semibold">Messages</h2>

                    {messageError && (
                        <div className="mb-4 rounded-lg bg-red-500/15 px-4 py-3 text-red-300">
                            {messageError}
                        </div>
                    )}

                    {isLoadingMessages ? (
                        <p className="text-white/60">Chargement des messages...</p>
                    ) : messages.length > 0 ? (
                        <div className="max-h-[420px] space-y-3 overflow-y-auto pr-2">
                            {messages.map((message) => (
                                <div key={message.id} className="rounded-lg bg-white/5 p-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="font-medium text-fuchsia-300">
                                            {message.author?.username || "Utilisateur"}
                                        </p>

                                        <p className="text-xs text-white/40">
                                            {new Date(message.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    {message.content.startsWith("https://media") ||
                                    message.content.includes("giphy.com") ? (
                                        <img
                                            src={message.content}
                                            alt="GIF"
                                            className="mt-2 max-h-56 rounded-lg"
                                        />
                                    ) : (
                                        <p className="mt-2 text-white/85">{message.content}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white/60">
                            Aucun message pour le moment. Sois le premier à parler, petit chef.
                        </p>
                    )}

                    {isGifPickerOpen && (
                        <div className="mt-6 rounded-2xl border border-white/10 bg-neutral-950 p-4 shadow-xl">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h3 className="font-semibold text-white">Choisir un GIF</h3>

                                <button
                                    type="button"
                                    onClick={() => setIsGifPickerOpen(false)}
                                    className="rounded-lg bg-white/10 px-3 py-1 text-sm hover:bg-white/20"
                                >
                                    Fermer
                                </button>
                            </div>

                            <div className="flex gap-3">
                                <input
                                    value={gifQuery}
                                    onChange={(event) => setGifQuery(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            event.preventDefault();
                                            void handleSearchGifs();
                                        }
                                    }}
                                    placeholder="Rechercher un GIF..."
                                    className="flex-1 rounded-lg border border-white/10 bg-neutral-800 px-4 py-3 outline-none focus:border-fuchsia-400"
                                />

                                <button
                                    type="button"
                                    onClick={() => void handleSearchGifs()}
                                    disabled={isSearchingGifs}
                                    className="rounded-lg bg-fuchsia-500 px-5 py-3 font-semibold hover:bg-fuchsia-600 disabled:opacity-60"
                                >
                                    {isSearchingGifs ? "..." : "OK"}
                                </button>
                            </div>

                            <div className="mt-4 max-h-80 overflow-y-auto pr-2">
                                {isSearchingGifs ? (
                                    <p className="py-6 text-center text-white/60">
                                        Chargement des GIFs...
                                    </p>
                                ) : gifs.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                        {gifs.map((gif) => (
                                            <button
                                                key={gif.id}
                                                type="button"
                                                onClick={() => void handleSendGif(gif)}
                                                className="overflow-hidden rounded-lg border border-white/10 bg-white/5 hover:border-fuchsia-400"
                                            >
                                                {gif.imageUrl && (
                                                    <img
                                                        src={gif.imageUrl}
                                                        alt={gif.title || "GIF"}
                                                        className="h-32 w-full object-cover"
                                                    />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="py-6 text-center text-white/60">
                                        Aucun GIF trouvé.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSendMessage} className="mt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={() => void handleToggleGifPicker()}
                            className="rounded-lg border border-white/10 bg-neutral-800 px-4 py-3 text-xl hover:border-fuchsia-400 hover:bg-neutral-700"
                            title="Envoyer un GIF"
                        >
                            GIF
                        </button>

                        <input
                            value={content}
                            onChange={(event) => setContent(event.target.value)}
                            placeholder="Écris ton message..."
                            className="flex-1 rounded-lg border border-white/10 bg-neutral-800 px-4 py-3 outline-none focus:border-fuchsia-400"
                        />

                        <button
                            type="submit"
                            disabled={isSending || !content.trim()}
                            className="rounded-lg bg-fuchsia-500 px-5 py-3 font-semibold hover:bg-fuchsia-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSending ? "Envoi..." : "Envoyer"}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}