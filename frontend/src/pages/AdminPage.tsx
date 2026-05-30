import { useEffect, useMemo, useState } from "react";
import {
    deleteAdminUser,
    getAdminStats,
    getAdminUsers,
    type AdminStats,
    type AdminUser,
    updateAdminUserRole,
} from "../features/admin/admin.api";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";
import { useAuth } from "../features/auth/useAuth";

export default function AdminPage() {
    const { user: currentUser } = useAuth();

    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let isMounted = true;

        async function fetchAdminData() {
            try {
                const [statsResponse, usersResponse] = await Promise.all([
                    getAdminStats(),
                    getAdminUsers(),
                ]);

                if (!isMounted) {
                    return;
                }

                setStats(statsResponse.stats);
                setUsers(usersResponse.users);
                setError("");
            } catch (err) {
                if (!isMounted) {
                    return;
                }

                setError(
                    getApiErrorMessage(
                        err,
                        "Impossible de charger l'espace administrateur"
                    )
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        setIsLoading(true);
        void fetchAdminData();

        return () => {
            isMounted = false;
        };
    }, [reloadKey]);

    const filteredUsers = useMemo(() => {
        const q = search.trim().toLowerCase();

        if (!q) {
            return users;
        }

        return users.filter((user) => {
            return (
                user.email.toLowerCase().includes(q) ||
                user.username.toLowerCase().includes(q) ||
                user.firstName.toLowerCase().includes(q) ||
                user.lastName.toLowerCase().includes(q)
            );
        });
    }, [users, search]);

    async function handleRoleChange(userId: string, role: "USER" | "ADMIN") {
        try {
            setError("");
            setSuccess("");

            const response = await updateAdminUserRole(userId, role);

            setUsers((prev) =>
                prev.map((user) =>
                    user.id === userId
                        ? {
                            ...user,
                            role: response.user.role,
                        }
                        : user
                )
            );

            setSuccess("Rôle mis à jour avec succès.");
        } catch (err) {
            setError(
                getApiErrorMessage(err, "Impossible de modifier le rôle")
            );
        }
    }

    async function handleDeleteUser(userId: string) {
        const confirmDelete = window.confirm(
            "Supprimer définitivement cet utilisateur ?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await deleteAdminUser(userId);

            setUsers((prev) => prev.filter((user) => user.id !== userId));

            setSuccess("Utilisateur supprimé avec succès.");
        } catch (err) {
            setError(
                getApiErrorMessage(
                    err,
                    "Impossible de supprimer cet utilisateur"
                )
            );
        }
    }

    if (isLoading) {
        return (
            <section className="mx-auto max-w-6xl px-4 py-8 text-white">
                Chargement de l'administration...
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-6xl space-y-8 px-4 py-8 text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-fuchsia-300">
                        Administration
                    </p>

                    <h1 className="mt-2 text-3xl font-black">
                        Tableau de bord administrateur
                    </h1>

                    <p className="mt-2 text-white/60">
                        Gestion globale des utilisateurs et statistiques de
                        Mchichat.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setReloadKey((prev) => prev + 1)}
                    className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
                >
                    Actualiser
                </button>
            </div>

            {error && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-200">
                    {success}
                </div>
            )}

            {stats && (
                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard label="Utilisateurs" value={stats.usersCount} />
                    <StatCard label="Salons" value={stats.salonsCount} />
                    <StatCard label="Messages salons" value={stats.messagesCount} />
                    <StatCard
                        label="Messages privés"
                        value={stats.privateMessagesCount}
                    />
                    <StatCard label="Posts" value={stats.postsCount} />
                    <StatCard label="Commentaires" value={stats.commentsCount} />
                </div>
            )}

            <div className="rounded-3xl border border-white/10 bg-neutral-900 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Utilisateurs</h2>

                        <p className="text-sm text-white/50">
                            Modifier les rôles ou supprimer un compte.
                        </p>
                    </div>

                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Rechercher..."
                        className="rounded-xl border border-white/10 bg-neutral-800 px-4 py-2 text-sm outline-none focus:border-fuchsia-400"
                    />
                </div>

                <div className="mt-5 overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left text-sm">
                        <thead className="border-b border-white/10 text-white/50">
                        <tr>
                            <th className="py-3">Utilisateur</th>
                            <th className="py-3">Email</th>
                            <th className="py-3">Rôle</th>
                            <th className="py-3">Activité</th>
                            <th className="py-3 text-right">Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {filteredUsers.map((user) => {
                            const isMe = currentUser?.id === user.id;

                            return (
                                <tr
                                    key={user.id}
                                    className="border-b border-white/5"
                                >
                                    <td className="py-4">
                                        <div className="font-semibold">
                                            {user.firstName} {user.lastName}
                                        </div>

                                        <div className="text-white/50">
                                            @{user.username}
                                        </div>
                                    </td>

                                    <td className="py-4 text-white/70">
                                        {user.email}
                                    </td>

                                    <td className="py-4">
                                        <select
                                            value={user.role}
                                            disabled={isMe}
                                            onChange={(event) =>
                                                handleRoleChange(
                                                    user.id,
                                                    event.target.value as
                                                        | "USER"
                                                        | "ADMIN"
                                                )
                                            }
                                            className="rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 outline-none disabled:opacity-50"
                                        >
                                            <option value="USER">USER</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    </td>

                                    <td className="py-4 text-white/60">
                                        {user._count?.posts ?? 0} posts ·{" "}
                                        {user._count?.messages ?? 0} messages
                                    </td>

                                    <td className="py-4 text-right">
                                        <button
                                            disabled={isMe}
                                            onClick={() =>
                                                handleDeleteUser(user.id)
                                            }
                                            className="rounded-lg bg-red-500/15 px-3 py-2 font-semibold text-red-200 hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>

                    {filteredUsers.length === 0 && (
                        <p className="py-8 text-center text-white/50">
                            Aucun utilisateur trouvé.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-3xl border border-white/10 bg-neutral-900 p-5">
            <p className="text-sm text-white/50">{label}</p>
            <p className="mt-2 text-3xl font-black">{value}</p>
        </div>
    );
}