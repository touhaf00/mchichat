import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type FormEvent,
} from "react";
import {
    getFriendsRequest,
    type FriendUser,
} from "../features/friends/friends.api";
import { searchGifsRequest, type GifResult } from "../features/giphy/giphy.api";
import {
    createPrivateConversationRequest,
    deletePrivateMessageRequest,
    getPrivateConversationsRequest,
    getPrivateMessagesRequest,
    sendPrivateMessageRequest,
    type PrivateConversation,
    type PrivateMessage,
    type PrivateUser,
} from "../features/private-messages/privateMessages.api";
import { useAuth } from "../features/auth/useAuth";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";
import { socket } from "../lib/socket";
import { useNotifications } from "../features/notifications/NotificationProvider";

function getOtherParticipant(
    conversation: PrivateConversation,
    currentUserId?: string
): PrivateUser | null {
    const participant = conversation.participants.find(
        (item) => item.userId !== currentUserId
    );

    return participant?.user ?? null;
}

export default function PrivateMessagesPage() {
    const { user } = useAuth();
    const { counts, resetConversation } = useNotifications();

    const messagesContainerRef = useRef<HTMLDivElement | null>(null);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

    const [friends, setFriends] = useState<FriendUser[]>([]);
    const [conversations, setConversations] = useState<PrivateConversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

    const [messages, setMessages] = useState<PrivateMessage[]>([]);
    const [content, setContent] = useState("");

    const [showGifPicker, setShowGifPicker] = useState(false);
    const [gifSearch, setGifSearch] = useState("");
    const [gifs, setGifs] = useState<GifResult[]>([]);
    const [isLoadingGifs, setIsLoadingGifs] = useState(false);

    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isStartingConversation, setIsStartingConversation] = useState(false);

    const [error, setError] = useState("");
    const [messageError, setMessageError] = useState("");

    function isScrolledToBottom() {
        const element = messagesContainerRef.current;

        if (!element) return true;

        const distanceFromBottom =
            element.scrollHeight - element.scrollTop - element.clientHeight;

        return distanceFromBottom < 80;
    }

    const selectedConversation = useMemo(() => {
        return conversations.find(
            (conversation) => conversation.id === selectedConversationId
        );
    }, [conversations, selectedConversationId]);

    const selectedFriend = selectedConversation
        ? getOtherParticipant(selectedConversation, user?.id)
        : null;

    const loadConversations = useCallback(async () => {
        try {
            setIsLoadingConversations(true);
            setError("");

            const [conversationsData, friendsData] = await Promise.all([
                getPrivateConversationsRequest(),
                getFriendsRequest(),
            ]);

            setConversations(conversationsData.conversations);
            setFriends(friendsData.friends);

            if (!selectedConversationId && conversationsData.conversations.length > 0) {
                setSelectedConversationId(conversationsData.conversations[0].id);
            }
        } catch (error: unknown) {
            setError(
                getApiErrorMessage(error, "Erreur lors du chargement des conversations")
            );
        } finally {
            setIsLoadingConversations(false);
        }
    }, [selectedConversationId]);

    const loadMessages = useCallback(async () => {
        if (!selectedConversationId) {
            setMessages([]);
            return;
        }

        try {
            setIsLoadingMessages(true);
            setMessageError("");
            setUnreadMessagesCount(0);

            const data = await getPrivateMessagesRequest(selectedConversationId);
            setMessages(data.messages);
        } catch (error: unknown) {
            setMessageError(
                getApiErrorMessage(error, "Erreur lors du chargement des messages")
            );
        } finally {
            setIsLoadingMessages(false);
        }
    }, [selectedConversationId]);

    const handleSearchGifs = useCallback(async (search = "funny") => {
        try {
            setIsLoadingGifs(true);
            setMessageError("");

            const data = await searchGifsRequest(search.trim() || "funny");
            setGifs(data.gifs);
        } catch (error: unknown) {
            setMessageError(
                getApiErrorMessage(error, "Erreur lors du chargement des GIFs")
            );
        } finally {
            setIsLoadingGifs(false);
        }
    }, []);

    useEffect(() => {
        void loadConversations();
    }, [loadConversations]);

    useEffect(() => {
        void loadMessages();
    }, [loadMessages]);

    useEffect(() => {
        if (!selectedConversationId) return;

        resetConversation(selectedConversationId);
    }, [selectedConversationId, resetConversation]);

    useEffect(() => {
        if (showGifPicker && gifs.length === 0) {
            void handleSearchGifs("funny");
        }
    }, [showGifPicker, gifs.length, handleSearchGifs]);

    useEffect(() => {
        if (!selectedConversationId) return;

        socket.connect();
        socket.emit("join_private_conversation", selectedConversationId);

        socket.on("private_message_created", (newMessage: PrivateMessage) => {
            setMessages((currentMessages) => {
                const alreadyExists = currentMessages.some(
                    (message) => message.id === newMessage.id
                );

                if (alreadyExists) {
                    return currentMessages;
                }

                return [...currentMessages, newMessage];
            });

            const isMine = newMessage.authorId === user?.id;

            resetConversation(selectedConversationId);

            if (!isMine && !isScrolledToBottom()) {
                setUnreadMessagesCount((count) => count + 1);
            }
        });

        return () => {
            socket.emit("leave_private_conversation", selectedConversationId);
            socket.off("private_message_created");
        };
    }, [selectedConversationId, user?.id]);

    async function handleStartConversation(friendId: string) {
        try {
            setIsStartingConversation(true);
            setError("");

            const data = await createPrivateConversationRequest(friendId);

            await loadConversations();
            setSelectedConversationId(data.conversation.id);
        } catch (error: unknown) {
            setError(
                getApiErrorMessage(error, "Erreur lors de la création de conversation")
            );
        } finally {
            setIsStartingConversation(false);
        }
    }

    async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!selectedConversationId) return;

        const trimmedContent = content.trim();

        if (!trimmedContent) return;

        try {
            setIsSending(true);
            setMessageError("");

            await sendPrivateMessageRequest(selectedConversationId, {
                content: trimmedContent,
            });

            setContent("");
            resetConversation(selectedConversationId);
            setUnreadMessagesCount(0);
            await loadConversations();
        } catch (error: unknown) {
            setMessageError(
                getApiErrorMessage(error, "Erreur lors de l'envoi du message")
            );
        } finally {
            setIsSending(false);
        }
    }

    async function handleSendGif(gif: GifResult) {
        if (!selectedConversationId || !gif.imageUrl) return;

        try {
            setIsSending(true);
            setMessageError("");

            await sendPrivateMessageRequest(selectedConversationId, {
                gifUrl: gif.imageUrl,
            });

            setShowGifPicker(false);
            setGifSearch("");
            await loadConversations();
        } catch (error: unknown) {
            setMessageError(
                getApiErrorMessage(error, "Erreur lors de l'envoi du GIF")
            );
        } finally {
            setIsSending(false);
        }
    }

    async function handleDeleteMessage(messageId: string) {
        const confirmed = window.confirm("Supprimer ce message privé ?");
        if (!confirmed) return;

        try {
            setMessageError("");

            await deletePrivateMessageRequest(messageId);
            await loadMessages();
            await loadConversations();
        } catch (error: unknown) {
            setMessageError(
                getApiErrorMessage(error, "Erreur lors de la suppression")
            );
        }
    }

    const friendsWithoutConversation = friends.filter((friend) => {
        return !conversations.some((conversation) =>
            conversation.participants.some(
                (participant) => participant.userId === friend.id
            )
        );
    });

    return (
        <section className="grid min-h-[70vh] gap-6 lg:grid-cols-[320px_1fr]">
            <aside className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
                    <h1 className="text-2xl font-bold">Messages privés</h1>
                    <p className="mt-2 text-sm text-white/60">
                        Discute en privé avec tes amis.
                    </p>
                </div>

                {error && (
                    <div className="rounded-xl bg-red-500/15 p-4 text-red-300">
                        {error}
                    </div>
                )}

                <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
                    <h2 className="mb-4 font-semibold">Conversations</h2>

                    {isLoadingConversations ? (
                        <p className="text-white/60">Chargement...</p>
                    ) : conversations.length > 0 ? (
                        <div className="space-y-2">
                            {conversations.map((conversation) => {
                                const otherUser = getOtherParticipant(conversation, user?.id);
                                const lastMessage = conversation.messages?.[0];

                                const unreadCount = counts.messagesByConversationId[conversation.id] || 0;
                                const hasUnread = unreadCount > 0;

                                return (
                                    <button
                                        key={conversation.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedConversationId(conversation.id);
                                            setShowGifPicker(false);
                                            setUnreadMessagesCount(0);
                                            resetConversation(conversation.id);
                                        }}
                                        className={`w-full rounded-xl p-3 text-left transition ${
                                            selectedConversationId === conversation.id
                                                ? "bg-fuchsia-500/20 ring-1 ring-fuchsia-400"
                                                : hasUnread
                                                    ? "bg-fuchsia-500/10 ring-1 ring-fuchsia-400"
                                                    : "bg-white/5 hover:bg-white/10"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="font-semibold">
                                                {otherUser?.username || "Utilisateur"}
                                            </p>

                                            {hasUnread && (
                                                <span
                                                    className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
        </span>
                                            )}
                                        </div>

                                        <p className="truncate text-sm text-white/50">
                                            {lastMessage?.gifUrl
                                                ? "GIF"
                                                : lastMessage?.content || "Aucun message"}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-white/60">Aucune conversation.</p>
                    )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
                    <h2 className="mb-4 font-semibold">Démarrer une discussion</h2>

                    {friendsWithoutConversation.length > 0 ? (
                        <div className="space-y-2">
                            {friendsWithoutConversation.map((friend) => (
                                <button
                                    key={friend.id}
                                    type="button"
                                    disabled={isStartingConversation}
                                    onClick={() => void handleStartConversation(friend.id)}
                                    className="w-full rounded-xl bg-white/5 p-3 text-left hover:bg-white/10 disabled:opacity-60"
                                >
                                    <p className="font-semibold">{friend.username}</p>
                                    <p className="text-sm text-white/50">
                                        {friend.firstName} {friend.lastName}
                                    </p>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white/60">
                            Aucun ami disponible pour une nouvelle discussion.
                        </p>
                    )}
                </div>
            </aside>

            <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
                {selectedConversationId ? (
                    <div className="flex h-full min-h-[650px] flex-col">
                        <div className="border-b border-white/10 pb-4">
                            <h2 className="text-2xl font-bold">
                                {selectedFriend?.username || "Conversation"}
                            </h2>
                            {selectedFriend && (
                                <p className="text-sm text-white/60">
                                    {selectedFriend.firstName} {selectedFriend.lastName}
                                </p>
                            )}
                        </div>

                        {messageError && (
                            <div className="mt-4 rounded-xl bg-red-500/15 p-4 text-red-300">
                                {messageError}
                            </div>
                        )}

                        <div
                            ref={messagesContainerRef}
                            onScroll={() => {
                                if (isScrolledToBottom()) {
                                    setUnreadMessagesCount(0);
                                }
                            }}
                            className="mt-4 flex-1 space-y-3 overflow-y-auto pr-2"
                        >
                            {isLoadingMessages ? (
                                <p className="text-white/60">Chargement des messages...</p>
                            ) : messages.length > 0 ? (
                                messages.map((message) => {
                                    const isMine = message.authorId === user?.id;

                                    return (
                                        <div
                                            key={message.id}
                                            className={`flex ${
                                                isMine ? "justify-end" : "justify-start"
                                            }`}
                                        >
                                            <div
                                                className={`max-w-[75%] rounded-2xl p-4 ${
                                                    isMine
                                                        ? "bg-fuchsia-500 text-white"
                                                        : "bg-white/10 text-white"
                                                }`}
                                            >
                                                <div className="mb-1 flex items-center justify-between gap-3">
                                                    <span className="text-xs opacity-80">
                                                        {message.author?.username}
                                                    </span>

                                                    <span className="text-xs opacity-60">
                                                        {new Date(message.createdAt).toLocaleTimeString(
                                                            [],
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            }
                                                        )}
                                                    </span>
                                                </div>

                                                {message.content && (
                                                    <p className="whitespace-pre-wrap">
                                                        {message.content}
                                                    </p>
                                                )}

                                                {message.gifUrl && (
                                                    <img
                                                        src={message.gifUrl}
                                                        alt="GIF"
                                                        className="mt-2 max-h-72 rounded-xl"
                                                    />
                                                )}

                                                {isMine && (
                                                    <button
                                                        type="button"
                                                        onClick={() => void handleDeleteMessage(message.id)}
                                                        className="mt-2 text-xs opacity-70 hover:opacity-100"
                                                    >
                                                        Supprimer
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-white/60">
                                    Aucun message privé pour le moment.
                                </p>
                            )}
                        </div>

                        {unreadMessagesCount > 0 && (
                            <button
                                type="button"
                                onClick={() => {
                                    messagesContainerRef.current?.scrollTo({
                                        top: messagesContainerRef.current.scrollHeight,
                                        behavior: "smooth",
                                    });
                                    setUnreadMessagesCount(0);
                                }}
                                className="mx-auto mt-3 rounded-full bg-fuchsia-500 px-4 py-2 text-sm font-semibold text-white hover:bg-fuchsia-600"
                            >
                                {unreadMessagesCount} message
                                {unreadMessagesCount > 1 ? "s" : ""} non lu
                            </button>
                        )}

                        <form onSubmit={handleSendMessage} className="mt-6 flex flex-col gap-3">
                            {showGifPicker && (
                                <div className="rounded-2xl border border-white/10 bg-neutral-950 p-4">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <h3 className="font-semibold">Choisir un GIF</h3>

                                        <button
                                            type="button"
                                            onClick={() => setShowGifPicker(false)}
                                            className="rounded-lg bg-white/10 px-3 py-1 text-sm hover:bg-white/20"
                                        >
                                            Fermer
                                        </button>
                                    </div>

                                    <div className="mb-4 flex gap-3">
                                        <input
                                            value={gifSearch}
                                            onChange={(event) => setGifSearch(event.target.value)}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter") {
                                                    event.preventDefault();
                                                    void handleSearchGifs(gifSearch);
                                                }
                                            }}
                                            placeholder="Rechercher un GIF..."
                                            className="flex-1 rounded-lg border border-white/10 bg-neutral-800 px-4 py-2 outline-none focus:border-fuchsia-400"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => void handleSearchGifs(gifSearch)}
                                            disabled={isLoadingGifs}
                                            className="rounded-lg bg-fuchsia-500 px-4 py-2 font-medium hover:bg-fuchsia-600 disabled:opacity-60"
                                        >
                                            {isLoadingGifs ? "..." : "OK"}
                                        </button>
                                    </div>

                                    {isLoadingGifs ? (
                                        <p className="py-6 text-center text-white/60">
                                            Chargement des GIFs...
                                        </p>
                                    ) : gifs.length > 0 ? (
                                        <div className="grid max-h-96 grid-cols-2 gap-3 overflow-y-auto pr-2 md:grid-cols-3">
                                            {gifs.map((gif) => (
                                                <button
                                                    key={gif.id}
                                                    type="button"
                                                    onClick={() => void handleSendGif(gif)}
                                                    className="overflow-hidden rounded-xl border border-white/10 bg-white/5 hover:border-fuchsia-400"
                                                >
                                                    {gif.imageUrl && (
                                                        <img
                                                            src={gif.imageUrl}
                                                            alt={gif.title || "GIF"}
                                                            className="h-40 w-full object-cover transition hover:scale-105"
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
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowGifPicker((prev) => !prev)}
                                    className="rounded-lg border border-white/10 bg-neutral-800 px-4 py-3 font-semibold hover:bg-neutral-700"
                                >
                                    GIF
                                </button>

                                <input
                                    value={content}
                                    onChange={(event) => setContent(event.target.value)}
                                    placeholder="Écris un message privé..."
                                    className="flex-1 rounded-lg border border-white/10 bg-neutral-800 px-4 py-3 outline-none focus:border-fuchsia-400"
                                />

                                <button
                                    type="submit"
                                    disabled={isSending || !content.trim()}
                                    className="rounded-lg bg-fuchsia-500 px-5 py-3 font-semibold hover:bg-fuchsia-600 disabled:opacity-60"
                                >
                                    {isSending ? "Envoi..." : "Envoyer"}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="flex h-full min-h-[650px] items-center justify-center text-center text-white/60">
                        Sélectionne une conversation ou démarre une discussion avec un ami.
                    </div>
                )}
            </div>
        </section>
    );
}