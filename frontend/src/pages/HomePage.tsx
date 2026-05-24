import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    MessageCircle,
    Newspaper,
    User,
    Users,
} from "lucide-react";
import { useAuth } from "../features/auth/useAuth";
import {
    getFriendsRequest,
    type FriendUser,
} from "../features/friends/friends.api";
import {
    getSalonsRequest,
    type Salon,
} from "../features/salons/salons.api";
import {
    getPrivateConversationsRequest,
    type PrivateConversation,
} from "../features/private-messages/privateMessages.api";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";

function getInitials(firstName?: string, lastName?: string) {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
}

export default function HomePage() {
    const { user, isAuthenticated } = useAuth();

    const [friends, setFriends] = useState<FriendUser[]>([]);
    const [salons, setSalons] = useState<Salon[]>([]);
    const [conversations, setConversations] = useState<PrivateConversation[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isAuthenticated) return;

        async function loadHomeData() {
            try {
                setError("");

                const [friendsData, salonsData, conversationsData] =
                    await Promise.all([
                        getFriendsRequest(),
                        getSalonsRequest(),
                        getPrivateConversationsRequest(),
                    ]);

                setFriends(friendsData.friends);
                setSalons(salonsData.salons);
                setConversations(conversationsData.conversations);
            } catch (err: unknown) {
                setError(
                    getApiErrorMessage(
                        err,
                        "Erreur lors du chargement de l'accueil"
                    )
                );
            }
        }

        void loadHomeData();
    }, [isAuthenticated]);

    if (isAuthenticated && user) {
        const recentConversations = conversations.slice(0, 4);
        const recentSalons = salons.slice(0, 5);
        const recentFriends = friends.slice(0, 5);

        return (
            <section className="grid gap-6 lg:grid-cols-[260px_1fr_320px]">
                <aside className="space-y-4">
                    <div className="rounded-3xl border border-white/10 bg-neutral-900 p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fuchsia-500 font-bold">
                                {getInitials(user.firstName, user.lastName)}
                            </div>

                            <div className="min-w-0">
                                <p className="truncate font-semibold">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="truncate text-sm text-white/50">
                                    @{user.username}
                                </p>
                            </div>
                        </div>

                        <Link
                            to={`/profile/${user.username}`}
                            className="mt-4 block rounded-2xl bg-white/10 px-4 py-3 text-center text-sm font-semibold hover:bg-white/15"
                        >
                            Voir mon profil
                        </Link>
                    </div>

                    <nav className="rounded-3xl border border-white/10 bg-neutral-900 p-3">
                        <Link
                            to="/feed"
                            className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-white/10"
                        >
                            <Newspaper className="h-5 w-5 text-white/60" />
                            <span>Fil d’actualité</span>
                        </Link>

                        <Link
                            to="/messages"
                            className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-white/10"
                        >
                            <MessageCircle className="h-5 w-5 text-white/60" />
                            <span>Messages</span>
                        </Link>

                        <Link
                            to="/dashboard"
                            className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-white/10"
                        >
                            <Users className="h-5 w-5 text-white/60" />
                            <span>Salons</span>
                        </Link>

                        <Link
                            to="/friends"
                            className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-white/10"
                        >
                            <User className="h-5 w-5 text-white/60" />
                            <span>Amis</span>
                        </Link>
                    </nav>

                    <div className="rounded-3xl border border-white/10 bg-neutral-900 p-5">
                        <p className="text-sm font-semibold text-white/70">
                            Résumé
                        </p>

                        <div className="mt-4 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-white/50">Amis</span>
                                <span className="font-semibold">{friends.length}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-white/50">Salons</span>
                                <span className="font-semibold">{salons.length}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-white/50">Conversations</span>
                                <span className="font-semibold">
                                    {conversations.length}
                                </span>
                            </div>
                        </div>
                    </div>
                </aside>

                <main className="space-y-6">
                    <div className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
                        <p className="text-sm text-white/50">
                            Accueil
                        </p>

                        <h1 className="mt-2 text-3xl font-bold">
                            Bienvenue {user.firstName}.
                        </h1>

                        <p className="mt-3 max-w-2xl text-white/60">
                            Retrouve tes conversations, tes salons et les dernières
                            activités de ton espace Mchichat.
                        </p>

                        {error && (
                            <div className="mt-5 rounded-2xl bg-red-500/15 p-4 text-red-300">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">
                                Messages récents
                            </h2>

                            <Link
                                to="/messages"
                                className="text-sm text-fuchsia-300 hover:underline"
                            >
                                Ouvrir
                            </Link>
                        </div>

                        <div className="mt-5 space-y-3">
                            {recentConversations.length > 0 ? (
                                recentConversations.map((conversation) => {
                                    const otherUser =
                                        conversation.participants.find(
                                            (participant) =>
                                                participant.userId !== user.id
                                        )?.user;

                                    const lastMessage = conversation.messages?.[0];

                                    return (
                                        <Link
                                            key={conversation.id}
                                            to={`/messages?conversationId=${conversation.id}`}
                                            className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 hover:bg-white/10"
                                        >
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold">
                                                {getInitials(
                                                    otherUser?.firstName,
                                                    otherUser?.lastName
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-semibold">
                                                    @{otherUser?.username || "Utilisateur"}
                                                </p>

                                                <p className="mt-1 truncate text-sm text-white/50">
                                                    {lastMessage?.attachmentUrl
                                                        ? lastMessage.attachmentType?.startsWith(
                                                            "audio/"
                                                        )
                                                            ? "Message vocal"
                                                            : "Pièce jointe"
                                                        : lastMessage?.gifUrl
                                                            ? "GIF"
                                                            : lastMessage?.content ||
                                                            "Aucun message"}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <p className="rounded-2xl bg-white/5 p-5 text-white/50">
                                    Aucune conversation pour le moment.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">
                                Salons récents
                            </h2>

                            <Link
                                to="/dashboard"
                                className="text-sm text-fuchsia-300 hover:underline"
                            >
                                Tout voir
                            </Link>
                        </div>

                        <div className="mt-5 space-y-3">
                            {recentSalons.length > 0 ? (
                                recentSalons.map((salon) => (
                                    <Link
                                        key={salon.id}
                                        to={`/salons/${salon.id}`}
                                        className="block rounded-2xl bg-white/5 p-4 hover:bg-white/10"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="font-semibold">
                                                {salon.name}
                                            </p>

                                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/50">
                                                {salon.visibility === "PRIVATE"
                                                    ? "Privé"
                                                    : "Public"}
                                            </span>
                                        </div>

                                        <p className="mt-2 truncate text-sm text-white/50">
                                            {salon.description || "Aucune description"}
                                        </p>
                                    </Link>
                                ))
                            ) : (
                                <p className="rounded-2xl bg-white/5 p-5 text-white/50">
                                    Aucun salon disponible.
                                </p>
                            )}
                        </div>
                    </div>
                </main>

                <aside className="space-y-6">
                    <div className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">
                                Tes amis
                            </h2>

                            <Link
                                to="/friends"
                                className="text-sm text-fuchsia-300 hover:underline"
                            >
                                Gérer
                            </Link>
                        </div>

                        <div className="mt-5 space-y-3">
                            {recentFriends.length > 0 ? (
                                recentFriends.map((friend) => (
                                    <Link
                                        key={friend.id}
                                        to={`/profile/${friend.username}`}
                                        className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 hover:bg-white/10"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fuchsia-500 font-bold">
                                            {getInitials(
                                                friend.firstName,
                                                friend.lastName
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate font-semibold">
                                                @{friend.username}
                                            </p>
                                            <p className="truncate text-sm text-white/50">
                                                {friend.firstName} {friend.lastName}
                                            </p>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p className="rounded-2xl bg-white/5 p-5 text-white/50">
                                    Aucun ami pour le moment.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
                        <h2 className="text-xl font-bold">
                            Publier quelque chose
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-white/50">
                            Partage une idée, une photo, une vidéo ou un moment avec
                            les autres.
                        </p>

                        <Link
                            to="/feed"
                            className="mt-5 block rounded-2xl bg-fuchsia-500 px-4 py-3 text-center font-semibold hover:bg-fuchsia-600"
                        >
                            Aller au fil
                        </Link>
                    </div>
                </aside>
            </section>
        );
    }

    return (
        <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center text-center">
            <h1 className="text-5xl font-bold text-white">
                Mchichat
            </h1>

            <p className="mt-5 text-lg leading-8 text-white/60">
                Discute avec tes amis, rejoins des salons et partage tes moments.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                    to="/register"
                    className="rounded-2xl bg-fuchsia-500 px-7 py-3 font-semibold hover:bg-fuchsia-600"
                >
                    Créer un compte
                </Link>

                <Link
                    to="/login"
                    className="rounded-2xl border border-white/10 bg-white/5 px-7 py-3 font-semibold hover:bg-white/10"
                >
                    Se connecter
                </Link>
            </div>
        </section>
    );
}