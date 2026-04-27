import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    getSalonByIdRequest,
    type SalonDetails,
} from "../features/salons/salons.api";
import {
    getMessages,
    sendMessage,
} from "../features/messages/messages.api";

type Message = {
    id: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    authorId: string;
    salonId: string;
    author?: {
        id: string;
        username: string;
        email?: string;
    };
};

export default function SalonPage() {
    const { id } = useParams();

    const [salon, setSalon] = useState<SalonDetails | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [content, setContent] = useState("");

    const [isLoadingSalon, setIsLoadingSalon] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const [isSending, setIsSending] = useState(false);

    const [error, setError] = useState("");
    const [messageError, setMessageError] = useState("");

    async function loadSalon() {
        if (!id) return;

        try {
            setIsLoadingSalon(true);
            setError("");

            const data = await getSalonByIdRequest(id);
            setSalon(data.salon);
        } catch (err: any) {
            setError(
                err?.response?.data?.message || "Erreur lors du chargement du salon"
            );
        } finally {
            setIsLoadingSalon(false);
        }
    }

    async function loadMessages() {
        if (!id) return;

        try {
            setIsLoadingMessages(true);
            setMessageError("");

            const data = await getMessages(id);
            setMessages(data.messages);
        } catch (err: any) {
            setMessageError(
                err?.response?.data?.message || "Erreur lors du chargement des messages"
            );
        } finally {
            setIsLoadingMessages(false);
        }
    }

    async function handleSendMessage(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!id) return;

        const trimmedContent = content.trim();

        if (!trimmedContent) {
            return;
        }

        try {
            setIsSending(true);
            setMessageError("");

            await sendMessage({
                salonId: id,
                content: trimmedContent,
            });

            setContent("");
            await loadMessages();
        } catch (err: any) {
            setMessageError(
                err?.response?.data?.message || "Erreur lors de l'envoi du message"
            );
        } finally {
            setIsSending(false);
        }
    }

    useEffect(() => {
        loadSalon();
        loadMessages();
    }, [id]);

    if (isLoadingSalon) {
        return <div>Chargement du salon...</div>;
    }

    if (error) {
        return (
            <div className="rounded-xl bg-red-500/15 p-4 text-red-300">
                {error}
            </div>
        );
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

                <p className="mt-3 text-white/70">
                    {salon.description || "Pas de description"}
                </p>

                <div className="mt-4 text-sm text-white/50">
                    <p>Visibilité : {salon.visibility}</p>
                    <p>Propriétaire : {salon.owner?.username || "Inconnu"}</p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
                <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
                    <h2 className="mb-4 text-2xl font-semibold">Membres</h2>

                    {salon.members && salon.members.length > 0 ? (
                        <div className="space-y-3">
                            {salon.members.map((member) => (
                                <div key={member.id} className="rounded-lg bg-white/5 p-3">
                                    <p className="font-medium">
                                        {member.user?.username || "Inconnu"}
                                    </p>
                                    <p className="text-sm text-white/60">
                                        {member.user?.email}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white/60">Aucun membre.</p>
                    )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
                    <h2 className="mb-4 text-2xl font-semibold">Messages</h2>

                    {messageError && (
                        <div className="mb-4 rounded-lg bg-red-500/15 px-4 py-3 text-red-300">
                            {messageError}
                        </div>
                    )}

                    {isLoadingMessages ? (
                        <p className="text-white/60">Chargement des messages...</p>
                    ) : messages.length > 0 ? (
                        <div className="max-h-[420px] space-y-3 overflow-y-auto pr-2">
                            {messages.map((message) => (
                                <div key={message.id} className="rounded-lg bg-white/5 p-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="font-medium text-fuchsia-300">
                                            {message.author?.username || "Utilisateur"}
                                        </p>

                                        <p className="text-xs text-white/40">
                                            {new Date(message.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    <p className="mt-2 text-white/85">{message.content}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white/60">
                            Aucun message pour le moment. Sois le premier à parler, petit chef.
                        </p>
                    )}

                    <form onSubmit={handleSendMessage} className="mt-6 flex gap-3">
                        <input
                            value={content}
                            onChange={(event) => setContent(event.target.value)}
                            placeholder="Écris ton message..."
                            className="flex-1 rounded-lg border border-white/10 bg-neutral-800 px-4 py-3 outline-none focus:border-fuchsia-400"
                        />

                        <button
                            type="submit"
                            disabled={isSending || !content.trim()}
                            className="rounded-lg bg-fuchsia-500 px-5 py-3 font-semibold hover:bg-fuchsia-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSending ? "Envoi..." : "Envoyer"}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}