import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    CalendarDays,
    ImageIcon,
    MessageCircle,
    Newspaper,
    PenLine,
    Settings,
    Users,
} from "lucide-react";
import { useAuth } from "../features/auth/useAuth";
import {
    getProfileRequest,
    type ProfilePost,
    type ProfileResponse,
} from "../features/profiles/profile.api";
import { createPrivateConversationRequest } from "../features/private-messages/privateMessages.api";
import { sendFriendRequestRequest } from "../features/friends/friends.api";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";
import { getPublicFileUrl } from "../lib/media";
import { useNotifications } from "../features/notifications/NotificationProvider";

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
    });
}

function getInitials(firstName?: string, lastName?: string) {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
}

function ProfilePostCard({ post }: { post: ProfilePost }) {
    const mediaUrl = post.mediaUrl ? getPublicFileUrl(post.mediaUrl) : null;

    return (
        <article className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
            <div className="flex items-center gap-3">
                {post.author.avatarUrl ? (
                    <img
                        src={getPublicFileUrl(post.author.avatarUrl)}
                        alt={post.author.username}
                        className="h-11 w-11 rounded-full object-cover"
                    />
                ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-fuchsia-500 font-bold">
                        {getInitials(post.author.firstName, post.author.lastName)}
                    </div>
                )}

                <div>
                    <Link
                        to={`/profile/${post.author.username}`}
                        className="font-semibold hover:text-fuchsia-300"
                    >
                        {post.author.firstName} {post.author.lastName}
                    </Link>

                    <p className="text-sm text-white/50">
                        @{post.author.username} ·{" "}
                        {new Date(post.createdAt).toLocaleString("fr-FR")}
                    </p>
                </div>
            </div>

            {post.content && (
                <p className="mt-5 whitespace-pre-wrap leading-7 text-white/85">
                    {post.content}
                </p>
            )}

            {mediaUrl && post.mediaType?.startsWith("image/") && (
                <img
                    src={mediaUrl}
                    alt="Publication"
                    className="mt-5 max-h-[520px] w-full rounded-3xl object-cover"
                />
            )}

            {mediaUrl && post.mediaType?.startsWith("video/") && (
                <video
                    src={mediaUrl}
                    controls
                    className="mt-5 max-h-[520px] w-full rounded-3xl object-cover"
                />
            )}

            <div className="mt-5 flex items-center gap-4 border-t border-white/10 pt-4 text-sm text-white/60">
                <span>{post.likesCount} j’aime</span>
                <span>{post.commentsCount} commentaire{post.commentsCount > 1 ? "s" : ""}</span>
            </div>
        </article>
    );
}

export default function ProfilePage() {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user, isLoading: isAuthLoading } = useAuth();
    const { showToast } = useNotifications();

    const profileUsername = username ?? user?.username ?? "";

    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSendingRequest, setIsSendingRequest] = useState(false);
    const [isOpeningConversation, setIsOpeningConversation] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadProfile() {
            if (isAuthLoading) return;

            if (!profileUsername) {
                setIsLoading(false);
                setError("Impossible de charger ce profil.");
                return;
            }

            try {
                setIsLoading(true);
                setError("");

                const data = await getProfileRequest(profileUsername);
                setProfile(data);
            } catch (err: unknown) {
                setError(
                    getApiErrorMessage(err, "Erreur lors du chargement du profil")
                );
            } finally {
                setIsLoading(false);
            }
        }

        void loadProfile();
    }, [profileUsername, isAuthLoading]);

    async function handleSendFriendRequest() {
        if (!profile) return;

        try {
            setIsSendingRequest(true);

            await sendFriendRequestRequest(profile.user.id);
            showToast("Demande d'ami envoyée");

            setProfile((current) =>
                current
                    ? {
                        ...current,
                        friendshipStatus: "PENDING_SENT",
                    }
                    : current
            );
        } catch (err: unknown) {
            showToast(getApiErrorMessage(err, "Impossible d'envoyer la demande"));
        } finally {
            setIsSendingRequest(false);
        }
    }

    async function handleOpenConversation() {
        if (!profile) return;

        try {
            setIsOpeningConversation(true);

            const data = await createPrivateConversationRequest(profile.user.id);
            navigate(`/messages?conversationId=${data.conversation.id}`);
        } catch (err: unknown) {
            showToast(getApiErrorMessage(err, "Impossible d'ouvrir la conversation"));
        } finally {
            setIsOpeningConversation(false);
        }
    }

    if (isLoading) {
        return (
            <div className="rounded-3xl border border-white/10 bg-neutral-900 p-8">
                Chargement du profil...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-3xl bg-red-500/15 p-8 text-red-300">
                {error}
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="rounded-3xl border border-white/10 bg-neutral-900 p-8">
                Profil introuvable.
            </div>
        );
    }

    const isMyProfile = profile.friendshipStatus === "ME";
    const avatarUrl = profile.user.avatarUrl
        ? getPublicFileUrl(profile.user.avatarUrl)
        : null;
    const bannerUrl = profile.user.bannerUrl
        ? getPublicFileUrl(profile.user.bannerUrl)
        : null;

    return (
        <section className="space-y-8">
            <div className="overflow-hidden rounded-[32px] border border-white/10 bg-neutral-900">
                <div className="relative h-64 bg-gradient-to-br from-fuchsia-500/30 via-blue-500/20 to-neutral-900">
                    {bannerUrl && (
                        <img
                            src={bannerUrl}
                            alt="Bannière"
                            className="h-full w-full object-cover"
                        />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 to-transparent" />
                </div>

                <div className="relative px-8 pb-8">
                    <div className="-mt-16 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <div className="flex items-end gap-5">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={profile.user.username}
                                    className="h-32 w-32 rounded-full border-4 border-neutral-900 object-cover"
                                />
                            ) : (
                                <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-neutral-900 bg-fuchsia-500 text-4xl font-black">
                                    {getInitials(profile.user.firstName, profile.user.lastName)}
                                </div>
                            )}

                            <div className="pb-2">
                                <h1 className="text-4xl font-black">
                                    {profile.user.firstName} {profile.user.lastName}
                                </h1>

                                <p className="mt-1 text-white/50">
                                    @{profile.user.username}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {isMyProfile ? (
                                <Link
                                    to="/profile/settings"
                                    className="inline-flex items-center gap-2 rounded-2xl bg-fuchsia-500 px-5 py-3 font-bold hover:bg-fuchsia-600"
                                >
                                    <Settings className="h-4 w-4" />
                                    Paramètres du profil
                                </Link>
                            ) : (
                                <>
                                    {profile.friendshipStatus === "NONE" && (
                                        <button
                                            type="button"
                                            onClick={() => void handleSendFriendRequest()}
                                            disabled={isSendingRequest}
                                            className="inline-flex items-center gap-2 rounded-2xl bg-fuchsia-500 px-5 py-3 font-bold hover:bg-fuchsia-600 disabled:opacity-60"
                                        >
                                            <Users className="h-4 w-4" />
                                            Ajouter
                                        </button>
                                    )}

                                    {profile.friendshipStatus === "PENDING_SENT" && (
                                        <button
                                            type="button"
                                            disabled
                                            className="rounded-2xl bg-white/10 px-5 py-3 font-bold text-white/60"
                                        >
                                            Demande envoyée
                                        </button>
                                    )}

                                    {profile.friendshipStatus === "PENDING_RECEIVED" && (
                                        <Link
                                            to="/friends"
                                            className="rounded-2xl bg-white/10 px-5 py-3 font-bold hover:bg-white/20"
                                        >
                                            Répondre à la demande
                                        </Link>
                                    )}

                                    {profile.friendshipStatus === "FRIENDS" && (
                                        <button
                                            type="button"
                                            onClick={() => void handleOpenConversation()}
                                            disabled={isOpeningConversation}
                                            className="inline-flex items-center gap-2 rounded-2xl bg-blue-500 px-5 py-3 font-bold hover:bg-blue-600 disabled:opacity-60"
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                            Message
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
                        <div>
                            <h2 className="text-xl font-bold">À propos</h2>

                            <p className="mt-3 max-w-3xl whitespace-pre-wrap leading-7 text-white/70">
                                {profile.user.bio ||
                                    "Ce profil n'a pas encore ajouté de bio."}
                            </p>

                            <div className="mt-5 flex flex-wrap gap-3 text-sm text-white/50">
                                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
                                    <CalendarDays className="h-4 w-4" />
                                    Membre depuis {formatDate(profile.user.createdAt)}
                                </span>

                                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
                                    <Newspaper className="h-4 w-4" />
                                    {profile.user._count?.posts || 0} posts
                                </span>

                                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
                                    <Users className="h-4 w-4" />
                                    {(profile.user._count?.memberships || 0) +
                                        (profile.user._count?.ownedSalons || 0)} salons
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
                <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black">
                            Publications
                        </h2>

                        {isMyProfile && (
                            <Link
                                to="/feed"
                                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20"
                            >
                                <PenLine className="h-4 w-4" />
                                Publier
                            </Link>
                        )}
                    </div>

                    {profile.posts.length > 0 ? (
                        profile.posts.map((post) => (
                            <ProfilePostCard key={post.id} post={post} />
                        ))
                    ) : (
                        <div className="rounded-3xl border border-white/10 bg-neutral-900 p-10 text-center text-white/60">
                            <ImageIcon className="mx-auto h-10 w-10 text-white/30" />
                            <p className="mt-4">
                                Aucune publication pour le moment.
                            </p>
                        </div>
                    )}
                </div>

                <aside className="space-y-5">
                    <div className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
                        <h3 className="font-bold">Identité</h3>

                        <div className="mt-4 space-y-3 text-sm">
                            <div>
                                <p className="text-white/40">Nom complet</p>
                                <p className="mt-1">
                                    {profile.user.firstName} {profile.user.lastName}
                                </p>
                            </div>

                            <div>
                                <p className="text-white/40">Username</p>
                                <p className="mt-1">@{profile.user.username}</p>
                            </div>

                            {isMyProfile && (
                                <div>
                                    <p className="text-white/40">Email</p>
                                    <p className="mt-1">{profile.user.email}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}