import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    getProfileRequest,
    type PublicProfileResponse,
} from "../features/profiles/profile.api";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";
import { useNotifications } from "../features/notifications/NotificationProvider";
import { sendFriendRequestRequest } from "../features/friends/friends.api";
import { createPrivateConversationRequest } from "../features/private-messages/privateMessages.api";
import { getPublicFileUrl } from "../lib/media";

export default function PublicProfilePage() {
    const { username } = useParams();
    const navigate = useNavigate();
    const { showToast } = useNotifications();

    const [profile, setProfile] = useState<PublicProfileResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpeningConversation, setIsOpeningConversation] = useState(false);

    async function loadProfile() {
        if (!username) return;

        try {
            setIsLoading(true);

            const data = await getProfileRequest(username);
            setProfile(data);
        } catch (error: unknown) {
            showToast(getApiErrorMessage(error, "Erreur lors du chargement du profil"));
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void loadProfile();
    }, [username]);

    async function handleAddFriend() {
        if (!profile) return;

        try {
            await sendFriendRequestRequest(profile.user.id);
            showToast("Demande d'ami envoyée");
            await loadProfile();
        } catch (error: unknown) {
            showToast(getApiErrorMessage(error, "Erreur lors de l'ajout"));
        }
    }

    async function handleStartConversation() {
        if (!profile) return;

        try {
            setIsOpeningConversation(true);

            const data = await createPrivateConversationRequest(profile.user.id);

            navigate(`/messages?conversationId=${data.conversation.id}`);
        } catch (error: unknown) {
            showToast(getApiErrorMessage(error, "Impossible d'ouvrir la conversation"));
        } finally {
            setIsOpeningConversation(false);
        }
    }

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
                Chargement du profil...
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="rounded-2xl bg-red-500/15 p-6 text-red-300">
                Profil introuvable.
            </div>
        );
    }

    const { user, posts, isMe, friendshipStatus } = profile;

    return (
        <section className="mx-auto max-w-4xl space-y-6">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-neutral-900">
                <div className="h-56 bg-gradient-to-br from-fuchsia-500/50 to-blue-500/30">
                    {user.bannerUrl && (
                        <img
                            src={getPublicFileUrl(user.bannerUrl)}
                            alt="Bannière"
                            className="h-full w-full object-cover"
                        />
                    )}
                </div>

                <div className="px-6 pb-6">
                    <div className="-mt-16 flex items-end justify-between gap-4">
                        <div className="flex items-end gap-4">
                            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-neutral-900 bg-fuchsia-500 text-4xl font-bold">
                                {user.avatarUrl ? (
                                    <img
                                        src={getPublicFileUrl(user.avatarUrl)}
                                        alt="Avatar"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <>
                                        {user.firstName[0]}
                                        {user.lastName[0]}
                                    </>
                                )}
                            </div>

                            <div className="mb-3">
                                <h1 className="text-3xl font-bold">
                                    {user.firstName} {user.lastName}
                                </h1>
                                <p className="text-white/50">@{user.username}</p>
                            </div>
                        </div>

                        <div className="mb-3 flex gap-2">
                            {isMe ? (
                                <Link
                                    to="/profile"
                                    className="rounded-xl bg-fuchsia-500 px-4 py-2 font-semibold hover:bg-fuchsia-600"
                                >
                                    Modifier mon profil
                                </Link>
                            ) : friendshipStatus === "ACCEPTED" ? (
                                <button
                                    type="button"
                                    onClick={() => void handleStartConversation()}
                                    disabled={isOpeningConversation}
                                    className="rounded-xl bg-fuchsia-500 px-4 py-2 font-semibold hover:bg-fuchsia-600 disabled:opacity-60"
                                >
                                    {isOpeningConversation ? "Ouverture..." : "Message"}
                                </button>
                            ) : friendshipStatus === "PENDING" ? (
                                <span className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white/70">
                                    Demande en attente
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => void handleAddFriend()}
                                    className="rounded-xl bg-blue-500 px-4 py-2 font-semibold hover:bg-blue-600"
                                >
                                    Ajouter
                                </button>
                            )}
                        </div>
                    </div>

                    <p className="mt-4 max-w-2xl text-white/75">
                        {user.bio || "Aucune bio pour le moment."}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Posts</h2>

                {posts.length > 0 ? (
                    posts.map((post) => (
                        <article
                            key={post.id}
                            className="rounded-3xl border border-white/10 bg-neutral-900 p-6"
                        >
                            {post.content && (
                                <p className="whitespace-pre-wrap text-white/90">
                                    {post.content}
                                </p>
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

                            <div className="mt-4 flex gap-4 text-sm text-white/50">
                                <span>{post.likesCount} likes</span>
                                <span>{post.commentsCount} commentaires</span>
                            </div>
                        </article>
                    ))
                ) : (
                    <div className="rounded-3xl border border-white/10 bg-neutral-900 p-8 text-center text-white/60">
                        Aucun post pour le moment.
                    </div>
                )}
            </div>
        </section>
    );
}