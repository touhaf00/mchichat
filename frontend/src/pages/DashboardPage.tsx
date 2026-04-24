import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/AuthContext";
import { SalonCreateForm } from "../features/salons/SalonCreateForm";
import { SalonList } from "../features/salons/SalonList";
import {
    deleteSalonRequest,
    getSalonsRequest,
    updateSalonRequest,
    type Salon,
} from "../features/salons/salons.api";

export default function DashboardPage() {
    const { user } = useAuth();
    const [salons, setSalons] = useState<Salon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadSalons() {
        try {
            setIsLoading(true);
            setError("");
            const data = await getSalonsRequest();
            setSalons(data.salons);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Erreur lors du chargement des salons");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadSalons();
    }, []);

    async function handleDelete(id: string) {
        const confirmed = window.confirm("Supprimer ce salon ?");
        if (!confirmed) return;

        try {
            await deleteSalonRequest(id);
            await loadSalons();
        } catch (err: any) {
            alert(err?.response?.data?.message || "Erreur lors de la suppression");
        }
    }

    async function handleQuickEdit(salon: Salon) {
        const nextName = window.prompt("Nouveau nom du salon :", salon.name);
        if (!nextName) return;

        try {
            await updateSalonRequest(salon.id, {
                name: nextName,
            });
            await loadSalons();
        } catch (err: any) {
            alert(err?.response?.data?.message || "Erreur lors de la modification");
        }
    }

    return (
        <section className="grid gap-8 lg:grid-cols-[380px_1fr]">
            <div>
                <SalonCreateForm onCreated={loadSalons} />
            </div>

            <div>
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="mt-2 text-white/70">
                        Bienvenue {user?.firstName}, voici les salons disponibles.
                    </p>
                </div>

                {isLoading ? (
                    <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
                        Chargement...
                    </div>
                ) : error ? (
                    <div className="rounded-2xl bg-red-500/15 p-6 text-red-300">{error}</div>
                ) : (
                    <SalonList
                        salons={salons}
                        currentUserId={user?.id}
                        onDelete={handleDelete}
                        onQuickEdit={handleQuickEdit}
                    />
                )}
            </div>
        </section>
    );
}