import { useEffect, useState, type FormEvent } from "react";
import {
    getFriendsRequest,
    getReceivedFriendRequestsRequest,
    getSentFriendRequestsRequest,
    respondToFriendRequestRequest,
    searchUsersRequest,
    sendFriendRequestRequest,
    type FriendRequest,
    type FriendUser,
} from "../features/friends/friends.api";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";

export default function FriendsPage() {
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState<FriendUser[]>([]);
    const [friends, setFriends] = useState<FriendUser[]>([]);
    const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
    const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    async function loadFriendData() {
        try {
            const [friendsData, receivedData, sentData] = await Promise.all([
                getFriendsRequest(),
                getReceivedFriendRequestsRequest(),
                getSentFriendRequestsRequest(),
            ]);

            setFriends(friendsData.friends);
            setReceivedRequests(receivedData.requests);
            setSentRequests(sentData.requests);
        } catch (error: unknown) {
            setError(getApiErrorMessage(error, "Erreur lors du chargement des amis"));
        }
    }

    useEffect(() => {
        void loadFriendData();
    }, []);

    async function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const username = query.trim();

        if (!username) return;

        try {
            setIsSearching(true);
            setError("");
            setMessage("");

            const data = await searchUsersRequest(username);
            setUsers(data.users);
        } catch (error: unknown) {
            setError(getApiErrorMessage(error, "Erreur lors de la recherche"));
        } finally {
            setIsSearching(false);
        }
    }

    async function handleSendRequest(receiverId: string) {
        try {
            setError("");
            setMessage("");

            const data = await sendFriendRequestRequest(receiverId);
            setMessage(data.message);
            await loadFriendData();
        } catch (error: unknown) {
            setError(getApiErrorMessage(error, "Erreur lors de l'envoi de la demande"));
        }
    }

    async function handleRespond(requestId: string, status: "ACCEPTED" | "REJECTED") {
        try {
            setError("");
            setMessage("");

            const data = await respondToFriendRequestRequest(requestId, status);
            setMessage(data.message);
            await loadFriendData();
        } catch (error: unknown) {
            setError(getApiErrorMessage(error, "Erreur lors de la réponse"));
        }
    }

    return (
        <section className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Amis</h1>
                <p className="mt-2 text-white/70">
                    Recherche un utilisateur par username et envoie une demande d’amitié.
                </p>
            </div>

            {message && (
                <div className="rounded-xl bg-green-500/15 p-4 text-green-300">
                    {message}
                </div>
            )}

            {error && (
                <div className="rounded-xl bg-red-500/15 p-4 text-red-300">
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSearch}
                className="rounded-2xl border border-white/10 bg-neutral-900 p-6"
            >
                <label className="mb-2 block text-sm text-white/70">
                    Username
                </label>

                <div className="flex gap-3">
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Ex: aya"
                        className="flex-1 rounded-lg border border-white/10 bg-neutral-800 px-4 py-3 outline-none focus:border-fuchsia-400"
                    />

                    <button
                        type="submit"
                        disabled={isSearching || !query.trim()}
                        className="rounded-lg bg-fuchsia-500 px-5 py-3 font-semibold hover:bg-fuchsia-600 disabled:opacity-60"
                    >
                        {isSearching ? "Recherche..." : "Chercher"}
                    </button>
                </div>
            </form>

            <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
                <h2 className="mb-4 text-xl font-semibold">Résultats</h2>

                {users.length > 0 ? (
                    <div className="space-y-3">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between rounded-xl bg-white/5 p-4"
                            >
                                <div>
                                    <p className="font-semibold">{user.username}</p>
                                    <p className="text-sm text-white/60">
                                        {user.firstName} {user.lastName}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => void handleSendRequest(user.id)}
                                    className="rounded-lg bg-blue-500 px-4 py-2 font-medium hover:bg-blue-600"
                                >
                                    Ajouter
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-white/60">Aucun résultat pour le moment.</p>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
                    <h2 className="mb-4 text-xl font-semibold">Mes amis</h2>

                    {friends.length > 0 ? (
                        <div className="space-y-3">
                            {friends.map((friend) => (
                                <div key={friend.id} className="rounded-xl bg-white/5 p-4">
                                    <p className="font-semibold">{friend.username}</p>
                                    <p className="text-sm text-white/60">
                                        {friend.firstName} {friend.lastName}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white/60">Aucun ami pour le moment.</p>
                    )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
                    <h2 className="mb-4 text-xl font-semibold">Demandes reçues</h2>

                    {receivedRequests.length > 0 ? (
                        <div className="space-y-3">
                            {receivedRequests.map((request) => (
                                <div key={request.id} className="rounded-xl bg-white/5 p-4">
                                    <p className="font-semibold">{request.sender?.username}</p>
                                    <p className="text-sm text-white/60">
                                        {request.sender?.firstName} {request.sender?.lastName}
                                    </p>

                                    <div className="mt-3 flex gap-2">
                                        <button
                                            onClick={() => void handleRespond(request.id, "ACCEPTED")}
                                            className="rounded-lg bg-green-500 px-3 py-2 text-sm hover:bg-green-600"
                                        >
                                            Accepter
                                        </button>

                                        <button
                                            onClick={() => void handleRespond(request.id, "REJECTED")}
                                            className="rounded-lg bg-red-500 px-3 py-2 text-sm hover:bg-red-600"
                                        >
                                            Refuser
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white/60">Aucune demande reçue.</p>
                    )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
                    <h2 className="mb-4 text-xl font-semibold">Demandes envoyées</h2>

                    {sentRequests.length > 0 ? (
                        <div className="space-y-3">
                            {sentRequests.map((request) => (
                                <div key={request.id} className="rounded-xl bg-white/5 p-4">
                                    <p className="font-semibold">{request.receiver?.username}</p>
                                    <p className="text-sm text-white/60">
                                        {request.receiver?.firstName} {request.receiver?.lastName}
                                    </p>
                                    <p className="mt-2 text-xs text-white/40">
                                        En attente
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white/60">Aucune demande envoyée.</p>
                    )}
                </div>
            </div>
        </section>
    );
}