import { Link } from "react-router-dom";
import type { Salon } from "./salons.api";

type SalonListProps = {
    salons: Salon[];
    currentUserId?: string;
    unreadSalonsById?: Record<string, number>;
    onOpenSalon?: (salonId: string) => void;
    onDelete: (id: string) => void;
    onQuickEdit: (salon: Salon) => void;
    onRequestMembership?: (salonId: string) => void;
};

export function SalonList({
                              salons,
                              currentUserId,
                              unreadSalonsById = {},
                              onOpenSalon,
                              onDelete,
                              onQuickEdit,
                              onRequestMembership,
                          }: SalonListProps) {
    if (salons.length === 0) {
        return (
            <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6 text-white/60">
                Aucun salon disponible.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {salons.map((salon) => {
                const isOwner = salon.ownerId === currentUserId;
                const unreadCount = unreadSalonsById[salon.id] || 0;
                const hasUnread = unreadCount > 0;
                const isMember = salon.members?.some((member) => member.userId === currentUserId);
                const canRequestMembership =
                    salon.visibility === "PUBLIC" && !isOwner && !isMember;

                return (
                    <div
                        key={salon.id}
                        className={`rounded-2xl border p-5 transition ${
                            hasUnread
                                ? "border-fuchsia-400 bg-fuchsia-500/10 shadow-lg shadow-fuchsia-500/10"
                                : "border-white/10 bg-neutral-900"
                        }`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-semibold">
                                        {salon.name}
                                    </h2>

                                    {hasUnread && (
                                        <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                                            {unreadCount > 99 ? "99+" : unreadCount}
                                        </span>
                                    )}
                                </div>

                                <p className="mt-1 text-sm text-white/60">
                                    {salon.description || "Aucune description"}
                                </p>

                                <p className="mt-2 text-xs text-white/40">
                                    {salon.visibility === "PRIVATE"
                                        ? "Salon privé"
                                        : "Salon public"}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Link
                                    to={`/salons/${salon.id}`}
                                    onClick={() => onOpenSalon?.(salon.id)}
                                    className="rounded-lg bg-fuchsia-500 px-4 py-2 text-sm font-medium hover:bg-fuchsia-600"
                                >
                                    Ouvrir
                                </Link>
                                {canRequestMembership && (
                                    <button
                                        type="button"
                                        onClick={() => onRequestMembership?.(salon.id)}
                                        className={"rounded-lg bg-emerald-500 px-4 py-2 text-sm front-medium hover:bg-emerald-600"}
                                    >
                                        Devenir membre
                                    </button>
                                )}

                                {isOwner && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => onQuickEdit(salon)}
                                            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium hover:bg-blue-600"
                                        >
                                            Modifier
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => onDelete(salon.id)}
                                            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium hover:bg-red-600"
                                        >
                                            Supprimer
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
