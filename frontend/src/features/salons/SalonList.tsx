import { Link } from "react-router-dom";
import type { Salon } from "./Salons.api.ts";

type SalonListProps = {
    salons: Salon[];
    currentUserId?: string;
    onDelete: (id: string) => void;
    onQuickEdit: (salon: Salon) => void;
};

export function SalonList({
                              salons,
                              currentUserId,
                              onDelete,
                              onQuickEdit,
                          }: SalonListProps) {
    if (!salons.length) {
        return (
            <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
                Aucun salon pour le moment.
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {salons.map((salon) => {
                const isOwner = salon.ownerId === currentUserId;

                return (
                    <div
                        key={salon.id}
                        className="rounded-2xl border border-white/10 bg-neutral-900 p-5"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-semibold">{salon.name}</h3>
                                <p className="mt-2 text-white/70">
                                    {salon.description || "Pas de description"}
                                </p>
                                <div className="mt-3 text-sm text-white/50">
                                    <p>Visibilité : {salon.visibility}</p>
                                    <p>Propriétaire : {salon.owner?.username || "Inconnu"}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Link
                                    to={`/salons/${salon.id}`}
                                    className="rounded-lg bg-blue-500 px-4 py-2 text-center hover:bg-blue-600"
                                >
                                    Voir
                                </Link>

                                {isOwner && (
                                    <>
                                        <button
                                            onClick={() => onQuickEdit(salon)}
                                            className="rounded-lg bg-amber-500 px-4 py-2 hover:bg-amber-600"
                                        >
                                            Modifier
                                        </button>
                                        <button
                                            onClick={() => onDelete(salon.id)}
                                            className="rounded-lg bg-red-500 px-4 py-2 hover:bg-red-600"
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