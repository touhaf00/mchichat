import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { getFriendsRequest, type FriendUser } from "../features/friends/friends.api";
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

    const [friends, setFriends] = useState<FriendUser[]>([]);
    const [conversations, setConversations] = useState<PrivateConversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
        null
    );
    const [messages, setMessages] = useState<PrivateMessage[]>([]);
    const [content, setContent] = useState("");

    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isStartingConversation, setIsStartingConversation] = useState(false);

    const [error, setError] = useState("");
    const [messageError, setMessageError] = useState("");

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

    useEffect(() => {
        void loadConversations();
    }, [loadConversations]);

    useEffect(() => {
        void loadMessages();
    }, [loadMessages]);

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

            await sendPrivateMessageRequest(selectedConversationId, trimmedContent);
            setContent("");
            await loadMessages();
            await loadConversations();
        } catch (error: unknown) {
            setMessageError(
                getApiErrorMessage(error, "Erreur lors de l'envoi du message")
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

                                return (
                                    <button
                                        key={conversation.id}
                                        type="button"
                                        onClick={() => setSelectedConversationId(conversation.id)}
                                        className={`w-full rounded-xl p-3 text-left transition ${
                                            selectedConversationId === conversation.id
                                                ? "bg-fuchsia-500/20 ring-1 ring-fuchsia-400"
                                                : "bg-white/5 hover:bg-white/10"
                                        }`}
                                    >
                                        <p className="font-semibold">
                                            {otherUser?.username || "Utilisateur"}
                                        </p>
                                        <p className="truncate text-sm text-white/50">
                                            {lastMessage?.content || "Aucun message"}
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

                        <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-2">
                            {isLoadingMessages ? (
                                <p className="text-white/60">Chargement des messages...</p>
                            ) : messages.length > 0 ? (
                                messages.map((message) => {
                                    const isMine = message.authorId === user?.id;

                                    return (
                                        <div
                                            key={message.id}
                                            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
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
                            {new Date(message.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                          </span>
                                                </div>

                                                <p className="whitespace-pre-wrap">{message.content}</p>

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

                        <form onSubmit={handleSendMessage} className="mt-6 flex gap-3">
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
