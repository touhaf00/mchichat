import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/useAuth";
import { SalonCreateForm } from "../features/salons/SalonCreateForm";
import { SalonList } from "../features/salons/SalonList";
import {
    deleteSalonRequest,
    getSalonsRequest,
    updateSalonRequest,
    type Salon,
    acceptSalonMembershipRequestRequest,
    getSalonMembershipRequestsRequest,
    rejectSalonMembershipRequestRequest,
    requestSalonMembershipRequest,
    type SalonMembershipRequest,
} from "../features/salons/salons.api";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";
import { useNotifications } from "../features/notifications/NotificationProvider";

export default function DashboardPage() {
    const { user } = useAuth();
    const { counts, resetSalon, showToast } = useNotifications();

    const [salons, setSalons] = useState<Salon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [membershipRequests, setMembershipRequests] = useState<SalonMembershipRequest[]>([]);

    async function loadSalons() {
        try {
            setIsLoading(true);
            setError("");
            const data = await getSalonsRequest();
            setSalons(data.salons);
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, "Erreur lors du chargement des salons"));
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void loadSalons();
        void loadMembershipRequests();
    }, []);

    async function handleDelete(id: string) {
        const confirmed = window.confirm("Supprimer ce salon ?");
        if (!confirmed) return;

        try {
            await deleteSalonRequest(id);
            await loadSalons();
        } catch (err: unknown) {
            alert(getApiErrorMessage(err, "Erreur lors de la suppression"));
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
        } catch (err: unknown) {
            alert(getApiErrorMessage(err, "Erreur lors de la modification"));
        }
    }

    async function loadMembershipRequests() {
        try {
            const data = await getSalonMembershipRequestsRequest();
            setMembershipRequests(data.requests);
        } catch {
            // not all members are owners
        }
    }

    async function handleRequestMembership(salonId: string) {
        try {
            await requestSalonMembershipRequest(salonId);
            showToast("Demande d'adhésion envoyée");
        } catch (err: unknown) {
            showToast(getApiErrorMessage(err, "Erreur lors de la demande d'adhésion"));
        }
    }

    async function handleAcceptMembershipRequest(requestId: string) {
        try {
            await acceptSalonMembershipRequestRequest(requestId);
            showToast("Demande acceptée");
            await loadMembershipRequests();
            await loadSalons();
        } catch (err: unknown) {
            showToast(getApiErrorMessage(err, "Erreur lors de l'acceptation"));
        }
    }

    async function handleRejectMembershipRequest(requestId: string) {
        try {
            await rejectSalonMembershipRequestRequest(requestId);
            showToast("Demande refusée");
            await loadMembershipRequests();
        } catch (err: unknown) {
            showToast(getApiErrorMessage(err, "Erreur lors du refus"));
        }
    }

    useEffect(() => {
        function refreshSalons() {
            void loadSalons();
            void loadMembershipRequests();
        }

        window.addEventListener("salons:refresh", refreshSalons);

        return () => {
            window.removeEventListener("salons:refresh", refreshSalons);
        };
    }, []);

    return (
        <section className="grid gap-8 lg:grid-cols-[380px_1fr]">
            <div>
                <SalonCreateForm onCreated={loadSalons} />
            </div>

            <div>
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    {membershipRequests.length > 0 && (
                        <div className="mb-6 rounded-2xl border border-white/10 bg-neutral-900 p-6">
                            <h2 className="mb-4 text-xl font-semibold">
                                Demandes d'adhésion à mes salons
                            </h2>

                            <div className="space-y-3">
                                {membershipRequests.map((request) => (
                                    <div
                                        key={request.id}
                                        className="flex items-center justify-between rounded-xl bg-white/5 p-4"
                                    >
                                        <div>
                                            <p className="font-semibold">
                                                @{request.requester.username}
                                            </p>
                                            <p className="text-sm text-white/60">
                                                veut rejoindre le salon {request.salon.name}
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => void handleAcceptMembershipRequest(request.id)}
                                                className="rounded-lg bg-green-500 px-3 py-2 text-sm hover:bg-green-600"
                                            >
                                                Accepter
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => void handleRejectMembershipRequest(request.id)}
                                                className="rounded-lg bg-red-500 px-3 py-2 text-sm hover:bg-red-600"
                                            >
                                                Refuser
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <p className="mt-2 text-white/70">
                        Bienvenue {user?.firstName}, voici les salons disponibles.
                    </p>
                </div>

                {isLoading ? (
                    <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
                        Chargement...
                    </div>
                ) : error ? (
                    <div className="rounded-2xl bg-red-500/15 p-6 text-red-300">
                        {error}
                    </div>
                ) : (
                    <SalonList
                        salons={salons}
                        currentUserId={user?.id}
                        unreadSalonsById={counts.salonsBySalonId}
                        onOpenSalon={resetSalon}
                        onDelete={handleDelete}
                        onQuickEdit={handleQuickEdit}
                        onRequestMembership={handleRequestMembership}
                    />
                )}
            </div>
        </section>
    );
}
