import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSalonByIdRequest, type SalonDetails } from "../features/salons/salons.api";

export default function SalonPage() {
    const { id } = useParams();
    const [salon, setSalon] = useState<SalonDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadSalon() {
            if (!id) return;

            try {
                setIsLoading(true);
                setError("");
                const data = await getSalonByIdRequest(id);
                setSalon(data.salon);
            } catch (err: any) {
                setError(err?.response?.data?.message || "Erreur lors du chargement du salon");
            } finally {
                setIsLoading(false);
            }
        }

        loadSalon();
    }, [id]);

    if (isLoading) {
        return <div>Chargement...</div>;
    }

    if (error) {
        return <div className="rounded-xl bg-red-500/15 p-4 text-red-300">{error}</div>;
    }

    if (!salon) {
        return <div>Salon introuvable.</div>;
    }

    return (
        <section className="space-y-8">
            <Link to="/dashboard" className="text-fuchsia-400 hover:underline">
                ← Retour au dashboard
            </Link>

            <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
                <h1 className="text-3xl font-bold">{salon.name}</h1>
                <p className="mt-3 text-white/70">{salon.description || "Pas de description"}</p>
                <div className="mt-4 text-sm text-white/50">
                    <p>Visibilité : {salon.visibility}</p>
                    <p>Propriétaire : {salon.owner?.username || "Inconnu"}</p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
                    <h2 className="mb-4 text-2xl font-semibold">Membres</h2>
                    {salon.members && salon.members.length > 0 ? (
                        <div className="space-y-3">
                            {salon.members.map((member) => (
                                <div key={member.id} className="rounded-lg bg-white/5 p-3">
                                    <p className="font-medium">{member.user?.username || "Inconnu"}</p>
                                    <p className="text-sm text-white/60">{member.user?.email}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white/60">Aucun membre.</p>
                    )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
                    <h2 className="mb-4 text-2xl font-semibold">Messages</h2>
                    {salon.messages && salon.messages.length > 0 ? (
                        <div className="space-y-3">
                            {salon.messages.map((message) => (
                                <div key={message.id} className="rounded-lg bg-white/5 p-3">
                                    <p className="font-medium">{message.author?.username || "Inconnu"}</p>
                                    <p className="mt-1 text-white/80">{message.content}</p>
                                    <p className="mt-2 text-xs text-white/40">
                                        {new Date(message.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white/60">Aucun message.</p>
                    )}
                </div>
            </div>
        </section>
    );
}