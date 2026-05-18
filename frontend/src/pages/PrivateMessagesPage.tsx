import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type FormEvent,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
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
import { getPublicFileUrl } from "../lib/media";
import { startVoiceRecording, stopVoiceRecording, cancelVoiceRecording } from "../lib/voiceRecorder";
import { VoiceRecorderBar } from "../features/voice/VoiceRecorderBar";
import { AudioMessagePlayer } from "../features/voice/AudioMessagePlayer";

function formatFileSize(size?: number | null) {
    if (!size) return "";
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function getOtherParticipant(
    conversation: PrivateConversation,
    currentUserId?: string
): PrivateUser | null {
    const participant = conversation.participants.find(
        (item) => item.userId !== currentUserId
    );

    return participant?.user ?? null;
}

function MessageAttachment({ message }: { message: PrivateMessage }) {
    if (!message.attachmentUrl) return null;

    const url = getPublicFileUrl(message.attachmentUrl);
    const type = message.attachmentType || "";
    const name = message.attachmentName?.toLowerCase() || "";

    const isAudio =
        type.startsWith("audio/") ||
        name.endsWith(".webm") ||
        name.endsWith(".ogg") ||
        name.endsWith(".mp3") ||
        name.endsWith(".wav") ||
        name.endsWith(".m4a");

    if (type.startsWith("image/")) {
        return (
            <img
                src={url}
                alt={message.attachmentName || "Image"}
                className="mt-2 max-h-72 rounded-xl"
            />
        );
    }

    if (type.startsWith("video/")) {
        return (
            <video
                src={url}
                controls
                className="mt-2 max-h-72 rounded-xl"
            />
        );
    }

    if (isAudio) {
        return (
            <AudioMessagePlayer
                src={url}
                mimeType={message.attachmentType}
            />
        );
    }

    return (
        <a
            href={url}
            download={message.attachmentName || true}
            className="mt-2 block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm hover:bg-white/10"
        >
            Télécharger {message.attachmentName || "le fichier"}
            {message.attachmentSize ? ` · ${formatFileSize(message.attachmentSize)}` : ""}
        </a>
    );
}

export default function PrivateMessagesPage() {
    const { user } = useAuth();
    const { counts, resetConversation, showToast } = useNotifications();
    const [searchParams, setSearchParams] = useSearchParams();

    const conversationIdFromUrl = searchParams.get("conversationId");

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);

    const [friends, setFriends] = useState<FriendUser[]>([]);
    const [conversations, setConversations] = useState<PrivateConversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
        conversationIdFromUrl
    );

    const [messages, setMessages] = useState<PrivateMessage[]>([]);
    const [content, setContent] = useState("");

    const [attachment, setAttachment] = useState<File | Blob | null>(null);
    const [attachmentName, setAttachmentName] = useState("");
    const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState<string | null>(null);
    const [attachmentType, setAttachmentType] = useState("");

    const [isRecording, setIsRecording] = useState(false);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

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

    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const [voiceLevels, setVoiceLevels] = useState<number[]>(
        Array.from({ length: 28 }, () => 10)
    );

    const selectedConversation = useMemo(() => {
        return conversations.find(
            (conversation) => conversation.id === selectedConversationId
        );
    }, [conversations, selectedConversationId]);

    const selectedFriend = selectedConversation
        ? getOtherParticipant(selectedConversation, user?.id)
        : null;

    const friendsWithoutConversation = friends.filter((friend) => {
        return !conversations.some((conversation) =>
            conversation.participants.some(
                (participant) => participant.userId === friend.id
            )
        );
    });

    function isScrolledToBottom() {
        const element = messagesContainerRef.current;

        if (!element) return true;

        const distanceFromBottom =
            element.scrollHeight - element.scrollTop - element.clientHeight;

        return distanceFromBottom < 80;
    }

    function scrollToBottom(behavior: ScrollBehavior = "smooth") {
        window.setTimeout(() => {
            messagesContainerRef.current?.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior,
            });
        }, 50);
    }

    function clearAttachment() {
        if (attachmentPreviewUrl) {
            URL.revokeObjectURL(attachmentPreviewUrl);
        }

        setAttachment(null);
        setAttachmentName("");
        setAttachmentPreviewUrl(null);
        setAttachmentType("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    function setSelectedAttachment(file: File | Blob, name: string, type: string) {
        clearAttachment();

        setAttachment(file);
        setAttachmentName(name);
        setAttachmentType(type || "application/octet-stream");
        setAttachmentPreviewUrl(URL.createObjectURL(file));
    }

    const selectConversation = useCallback(
        (conversationId: string) => {
            setSelectedConversationId(conversationId);
            setSearchParams({ conversationId });
            setShowGifPicker(false);
            setUnreadMessagesCount(0);
            resetConversation(conversationId);
        },
        [resetConversation, setSearchParams]
    );

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

            const conversationFromUrl = conversationsData.conversations.find(
                (conversation) => conversation.id === conversationIdFromUrl
            );

            if (conversationFromUrl) {
                setSelectedConversationId(conversationFromUrl.id);
                resetConversation(conversationFromUrl.id);
                return;
            }

            if (!selectedConversationId && conversationsData.conversations.length > 0) {
                setSelectedConversationId(conversationsData.conversations[0].id);
            }
        } catch (err: unknown) {
            setError(
                getApiErrorMessage(err, "Erreur lors du chargement des conversations")
            );
        } finally {
            setIsLoadingConversations(false);
        }
    }, [conversationIdFromUrl, selectedConversationId, resetConversation]);

    const loadMessages = useCallback(async () => {
        if (!selectedConversationId) {
            setMessages([]);
            return;
        }

        try {
            setIsLoadingMessages(true);
            setMessageError("");
            setUnreadMessagesCount(0);
            resetConversation(selectedConversationId);

            const data = await getPrivateMessagesRequest(selectedConversationId);
            setMessages(data.messages);
            scrollToBottom("auto");
        } catch (err: unknown) {
            setMessageError(
                getApiErrorMessage(err, "Erreur lors du chargement des messages")
            );
        } finally {
            setIsLoadingMessages(false);
        }
    }, [selectedConversationId, resetConversation]);

    const handleSearchGifs = useCallback(async (search = "funny") => {
        try {
            setIsLoadingGifs(true);
            setMessageError("");

            const data = await searchGifsRequest(search.trim() || "funny");
            setGifs(data.gifs);
        } catch (err: unknown) {
            setMessageError(
                getApiErrorMessage(err, "Erreur lors du chargement des GIFs")
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
        if (conversationIdFromUrl && conversationIdFromUrl !== selectedConversationId) {
            setSelectedConversationId(conversationIdFromUrl);
            resetConversation(conversationIdFromUrl);
        }
    }, [conversationIdFromUrl, selectedConversationId, resetConversation]);

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

                if (alreadyExists) return currentMessages;

                return [...currentMessages, newMessage];
            });

            resetConversation(selectedConversationId);

            const isMine = newMessage.authorId === user?.id;

            if (!isMine && !isScrolledToBottom()) {
                setUnreadMessagesCount((count) => count + 1);
            } else {
                scrollToBottom();
            }
        });

        return () => {
            socket.emit("leave_private_conversation", selectedConversationId);
            socket.off("private_message_created");
        };
    }, [selectedConversationId, user?.id, resetConversation]);

    useEffect(() => {
        return () => {
            if (attachmentPreviewUrl) {
                URL.revokeObjectURL(attachmentPreviewUrl);
            }
        };
    }, [attachmentPreviewUrl]);

    async function handleStartConversation(friendId: string) {
        try {
            setIsStartingConversation(true);
            setError("");

            const data = await createPrivateConversationRequest(friendId);

            await loadConversations();
            selectConversation(data.conversation.id);
        } catch (err: unknown) {
            setError(
                getApiErrorMessage(err, "Erreur lors de la création de conversation")
            );
        } finally {
            setIsStartingConversation(false);
        }
    }

    async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!selectedConversationId) return;

        const trimmedContent = content.trim();

        if (!trimmedContent && !attachment) {
            showToast("Ajoute un message ou une pièce jointe");
            return;
        }

        try {
            setIsSending(true);
            setMessageError("");

            await sendPrivateMessageRequest(selectedConversationId, {
                content: trimmedContent || undefined,
                attachment,
                attachmentName,
            });

            setContent("");
            clearAttachment();
            resetConversation(selectedConversationId);
            setUnreadMessagesCount(0);
            await loadConversations();
            scrollToBottom();
        } catch (err: unknown) {
            setMessageError(
                getApiErrorMessage(err, "Erreur lors de l'envoi du message")
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
            resetConversation(selectedConversationId);
            setUnreadMessagesCount(0);
            await loadConversations();
            scrollToBottom();
        } catch (err: unknown) {
            setMessageError(
                getApiErrorMessage(err, "Erreur lors de l'envoi du GIF")
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
        } catch (err: unknown) {
            setMessageError(
                getApiErrorMessage(err, "Erreur lors de la suppression")
            );
        }
    }

    async function startRecording() {
        try {
            await startVoiceRecording({
                onLevels: setVoiceLevels,
                onTick: setRecordingSeconds,
            });

            setRecordingSeconds(0);
            setIsRecording(true);
            setMessageError("");
        } catch (error: unknown) {
            showToast(
                error instanceof Error
                    ? error.message
                    : "Impossible d'accéder au micro"
            );
        }
    }

    async function stopRecording() {
        try {
            const result = await stopVoiceRecording();

            setSelectedAttachment(
                result.file,
                result.file.name,
                result.file.type
            );
        } catch (error: unknown) {
            showToast(
                error instanceof Error
                    ? error.message
                    : "Impossible de finaliser le vocal"
            );
        } finally {
            setIsRecording(false);
            setRecordingSeconds(0);
            setVoiceLevels(Array.from({ length: 28 }, () => 10));
        }
    }

    function cancelRecording() {
        cancelVoiceRecording();
        setIsRecording(false);
        setRecordingSeconds(0);
        setVoiceLevels(Array.from({ length: 28 }, () => 10));
    }

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

                                const unreadCount =
                                    counts.messagesByConversationId[conversation.id] || 0;
                                const hasUnread = unreadCount > 0;

                                return (
                                    <button
                                        key={conversation.id}
                                        type="button"
                                        onClick={() => selectConversation(conversation.id)}
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
                                                <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                                                    {unreadCount > 99 ? "99+" : unreadCount}
                                                </span>
                                            )}
                                        </div>

                                        <p className="truncate text-sm text-white/50">
                                            {lastMessage?.attachmentUrl
                                                ? lastMessage.attachmentType?.startsWith("audio/")
                                                    ? "Message vocal"
                                                    : "Fichier"
                                                : lastMessage?.gifUrl
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
                                    <Link
                                        to={`/profile/${friend.username}`}
                                        onClick={(event) => event.stopPropagation()}
                                        className="font-semibold hover:text-fuchsia-300"
                                    >
                                        @{friend.username}
                                    </Link>

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
                            {selectedFriend?.username ? (
                                <Link
                                    to={`/profile/${selectedFriend.username}`}
                                    className="text-2xl font-bold hover:text-fuchsia-300"
                                >
                                    @{selectedFriend.username}
                                </Link>
                            ) : (
                                <h2 className="text-2xl font-bold">Conversation</h2>
                            )}

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

                                    if (selectedConversationId) {
                                        resetConversation(selectedConversationId);
                                    }
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
                                                    {message.author?.username ? (
                                                        <Link
                                                            to={`/profile/${message.author.username}`}
                                                            className="text-xs opacity-90 hover:underline"
                                                        >
                                                            @{message.author.username}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-xs opacity-80">
                                                            Utilisateur
                                                        </span>
                                                    )}

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

                                                <MessageAttachment message={message} />

                                                {isMine && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            void handleDeleteMessage(message.id)
                                                        }
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
                                    scrollToBottom();
                                    setUnreadMessagesCount(0);
                                    resetConversation(selectedConversationId);
                                }}
                                className="mx-auto mt-3 rounded-full bg-fuchsia-500 px-4 py-2 text-sm font-semibold text-white hover:bg-fuchsia-600"
                            >
                                {unreadMessagesCount} message
                                {unreadMessagesCount > 1 ? "s" : ""} non lu
                            </button>
                        )}

                        {showGifPicker && (
                            <div className="mt-4 rounded-2xl border border-white/10 bg-neutral-950 p-4">
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
                                        onChange={(event) =>
                                            setGifSearch(event.target.value)
                                        }
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
                                    <div className="grid max-h-80 grid-cols-2 gap-3 overflow-y-auto pr-2 md:grid-cols-3">
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

                        {attachment && attachmentPreviewUrl && (
                            <div className="mt-4 rounded-2xl border border-white/10 bg-neutral-950 p-3">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold">
                                            {attachmentName}
                                        </p>
                                        <p className="text-xs text-white/50">
                                            {attachment instanceof File
                                                ? formatFileSize(attachment.size)
                                                : ""}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={clearAttachment}
                                        className="rounded-lg bg-red-500 px-3 py-2 text-sm hover:bg-red-600"
                                    >
                                        Retirer
                                    </button>
                                </div>

                                {attachmentType.startsWith("image/") && (
                                    <img
                                        src={attachmentPreviewUrl}
                                        alt="Aperçu"
                                        className="max-h-72 rounded-xl"
                                    />
                                )}

                                {attachmentType.startsWith("video/") && (
                                    <video
                                        src={attachmentPreviewUrl}
                                        controls
                                        className="max-h-72 rounded-xl"
                                    />
                                )}

                                {attachmentType.startsWith("audio/") && (
                                    <audio
                                        controls
                                        preload="metadata"
                                        className="w-full"
                                    >
                                        <source
                                            src={attachmentPreviewUrl}
                                            type={attachmentType}
                                        />
                                    </audio>
                                )}
                            </div>
                        )}

                        {isRecording && (
                            <VoiceRecorderBar
                                seconds={recordingSeconds}
                                levels={voiceLevels}
                                onCancel={cancelRecording}
                                onStop={() => void stopRecording()}
                            />
                        )}

                        <form onSubmit={handleSendMessage} className="mt-6 space-y-3">
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    if (!file) return;
                                    setSelectedAttachment(file, file.name, file.type);
                                }}
                            />

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowGifPicker((prev) => !prev)}
                                    className="rounded-lg border border-white/10 bg-neutral-800 px-4 py-3 font-semibold hover:bg-neutral-700"
                                >
                                    GIF
                                </button>

                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="rounded-lg border border-white/10 bg-neutral-800 px-4 py-3 font-semibold hover:bg-neutral-700"
                                >
                                    Fichier
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        isRecording ? void stopRecording() : void startRecording()
                                    }
                                    className={`rounded-lg px-4 py-3 font-semibold ${
                                        isRecording
                                            ? "bg-red-500 hover:bg-red-600"
                                            : "border border-white/10 bg-neutral-800 hover:bg-neutral-700"
                                    }`}
                                >
                                    {isRecording ? "Stop" : "Vocal"}
                                </button>

                                <input
                                    value={content}
                                    onChange={(event) => setContent(event.target.value)}
                                    placeholder="Écris un message privé..."
                                    className="flex-1 rounded-lg border border-white/10 bg-neutral-800 px-4 py-3 outline-none focus:border-fuchsia-400"
                                />

                                <button
                                    type="submit"
                                    disabled={isSending || (!content.trim() && !attachment)}
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