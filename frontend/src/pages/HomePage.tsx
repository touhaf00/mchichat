import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Bell,
    MessageCircle,
    Newspaper,
    ShieldCheck,
    Sparkles,
    User,
    Users,
    Zap,
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
        const recentConversations = conversations.slice(0, 3);
        const recentSalons = salons.slice(0, 4);
        const recentFriends = friends.slice(0, 4);

        return (
            <section className="space-y-8">
                <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-fuchsia-500/20 via-neutral-900 to-blue-500/10 p-8 shadow-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-2 text-sm font-medium text-fuchsia-200">
                        <Sparkles className="h-4 w-4" />
                        Accueil personnel
                    </div>

                    <h1 className="mt-5 text-4xl font-black">
                        Salut {user.firstName}, Wassup aujoud'hui!!.
                    </h1>

                    <p className="mt-4 max-w-2xl text-white/70">
                        Ton Mchichat est prêt : messages, salons, fil
                        d’actualité, amis. Tout est centralisé ici
                        pour viber là ou le max de vibe se stock.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            to="/feed"
                            className="inline-flex items-center gap-2 rounded-2xl bg-fuchsia-500 px-5 py-3 font-bold hover:bg-fuchsia-600"
                        >
                            Voir le fil
                            <ArrowRight className="h-4 w-4" />
                        </Link>

                        <Link
                            to="/messages"
                            className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 font-bold hover:bg-white/20"
                        >
                            <MessageCircle className="h-4 w-4" />
                            Messages
                        </Link>

                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 font-bold hover:bg-white/20"
                        >
                            <Users className="h-4 w-4" />
                            Salons
                        </Link>

                        <Link
                            to="/friends"
                            className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 font-bold hover:bg-white/20"
                        >
                            <User className="h-4 w-4" />
                            Amis
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="rounded-2xl bg-red-500/15 p-4 text-red-300">
                        {error}
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-white/50">Amis</p>
                            <User className="h-5 w-5 text-fuchsia-300" />
                        </div>

                        <p className="mt-3 text-4xl font-black text-fuchsia-300">
                            {friends.length}
                        </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-white/50">
                                Salons accessibles
                            </p>
                            <Users className="h-5 w-5 text-blue-300" />
                        </div>

                        <p className="mt-3 text-4xl font-black text-blue-300">
                            {salons.length}
                        </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-white/50">
                                Conversations privées
                            </p>
                            <MessageCircle className="h-5 w-5 text-emerald-300" />
                        </div>

                        <p className="mt-3 text-4xl font-black text-emerald-300">
                            {conversations.length}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-bold">
                                Derniers salons
                            </h2>

                            <Link
                                to="/dashboard"
                                className="text-sm text-fuchsia-300 hover:underline"
                            >
                                Tout voir
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {recentSalons.length > 0 ? (
                                recentSalons.map((salon) => (
                                    <Link
                                        key={salon.id}
                                        to={`/salons/${salon.id}`}
                                        className="block rounded-2xl bg-white/5 p-4 hover:bg-white/10"
                                    >
                                        <p className="font-semibold">
                                            {salon.name}
                                        </p>

                                        <p className="mt-1 truncate text-sm text-white/50">
                                            {salon.description ||
                                                "Aucune description"}
                                        </p>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-white/50">
                                    Aucun salon pour le moment.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
                        <div className="mb-5 flex items-center justify-between">
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

                        <div className="space-y-3">
                            {recentConversations.length > 0 ? (
                                recentConversations.map((conversation) => {
                                    const otherUser =
                                        conversation.participants.find(
                                            (participant) =>
                                                participant.userId !== user.id
                                        )?.user;

                                    const lastMessage =
                                        conversation.messages?.[0];

                                    return (
                                        <Link
                                            key={conversation.id}
                                            to={`/messages?conversationId=${conversation.id}`}
                                            className="block rounded-2xl bg-white/5 p-4 hover:bg-white/10"
                                        >
                                            <p className="font-semibold">
                                                @{otherUser?.username ||
                                                "Utilisateur"}
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
                                        </Link>
                                    );
                                })
                            ) : (
                                <p className="text-white/50">
                                    Aucune conversation.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-bold">Tes amis</h2>

                            <Link
                                to="/friends"
                                className="text-sm text-fuchsia-300 hover:underline"
                            >
                                Gérer
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {recentFriends.length > 0 ? (
                                recentFriends.map((friend) => (
                                    <Link
                                        key={friend.id}
                                        to={`/profile/${friend.username}`}
                                        className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 hover:bg-white/10"
                                    >
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-fuchsia-500 font-bold">
                                            {friend.firstName[0]}
                                            {friend.lastName[0]}
                                        </div>

                                        <div>
                                            <p className="font-semibold">
                                                @{friend.username}
                                            </p>

                                            <p className="text-sm text-white/50">
                                                {friend.firstName}{" "}
                                                {friend.lastName}
                                            </p>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-white/50">
                                    Aucun ami pour le moment.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="rounded-[32px] border border-white/10 bg-neutral-900 p-8">
                    <h2 className="text-2xl font-black">
                        Que veux-tu faire maintenant ?
                    </h2>

                    <div className="mt-6 grid gap-4 md:grid-cols-4">
                        <Link
                            to="/feed"
                            className="rounded-2xl bg-fuchsia-500/15 p-5 hover:bg-fuchsia-500/25"
                        >
                            <Newspaper className="h-7 w-7 text-fuchsia-300" />

                            <p className="mt-3 font-bold">Publier</p>
                        </Link>

                        <Link
                            to="/messages"
                            className="rounded-2xl bg-blue-500/15 p-5 hover:bg-blue-500/25"
                        >
                            <MessageCircle className="h-7 w-7 text-blue-300" />

                            <p className="mt-3 font-bold">Discuter</p>
                        </Link>

                        <Link
                            to="/dashboard"
                            className="rounded-2xl bg-emerald-500/15 p-5 hover:bg-emerald-500/25"
                        >
                            <Users className="h-7 w-7 text-emerald-300" />

                            <p className="mt-3 font-bold">
                                Rejoindre un salon
                            </p>
                        </Link>

                        <Link
                            to={`/profile/${user.username}`}
                            className="rounded-2xl bg-orange-500/15 p-5 hover:bg-orange-500/25"
                        >
                            <User className="h-7 w-7 text-orange-300" />

                            <p className="mt-3 font-bold">Voir mon profil</p>
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="relative overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(217,70,239,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_30%)]" />

            <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-7xl flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-5 py-2 text-sm font-medium text-fuchsia-200">
                    <Zap className="h-4 w-4" />
                    Réseau social temps réel
                </div>

                <h1 className="text-6xl font-black">
                    <span className="bg-gradient-to-r from-fuchsia-400 via-pink-300 to-blue-400 bg-clip-text text-transparent">
                        Mchichat
                    </span>
                </h1>

                <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/70">
                    Une application sociale moderne avec fil d’actualité,
                    messages privés, salons.
                </p>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-2 rounded-2xl bg-fuchsia-500 px-8 py-4 text-lg font-bold hover:bg-fuchsia-600"
                    >
                        Commencer
                        <ArrowRight className="h-5 w-5" />
                    </Link>

                    <Link
                        to="/login"
                        className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold hover:bg-white/10"
                    >
                        Connexion
                    </Link>
                </div>

                <div className="mt-16 grid w-full max-w-5xl gap-5 md:grid-cols-3">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-left">
                        <MessageCircle className="h-8 w-8 text-fuchsia-300" />

                        <h2 className="mt-5 text-xl font-bold">
                            Messages instantanés
                        </h2>

                        <p className="mt-3 text-white/60">
                            Discute en privé avec médias, fichiers, GIFs et
                            vocaux.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-left">
                        <Bell className="h-8 w-8 text-blue-300" />

                        <h2 className="mt-5 text-xl font-bold">
                            Notifications live
                        </h2>

                        <p className="mt-3 text-white/60">
                            Reçois les événements importants en temps réel.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-left">
                        <ShieldCheck className="h-8 w-8 text-emerald-300" />

                        <h2 className="mt-5 text-xl font-bold">
                            Espace sécurisé
                        </h2>

                        <p className="mt-3 text-white/60">
                            Authentification JWT, salons privés et accès
                            protégés.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}