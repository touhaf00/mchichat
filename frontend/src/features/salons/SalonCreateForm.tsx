import { useState } from "react";
import { createSalonRequest } from "./salons.api.ts";
import {getApiErrorMessage} from "../../lib/getApiErrorMessage";

type SalonCreateFormProps = {
    onCreated: () => void;
};

export function SalonCreateForm({ onCreated }: SalonCreateFormProps) {
    const [form, setForm] = useState({
        name: "",
        description: "",
        visibility: "PUBLIC" as "PUBLIC" | "PRIVATE",
    });

    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleChange(
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        setForm((prev) => ({
            ...prev,
            [event.target.name]: event.target.value,
        }));
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            await createSalonRequest(form);
            setForm({
                name: "",
                description: "",
                visibility: "PUBLIC",
            });
            onCreated();
        } catch (err: unknown) {
            setError(getApiErrorMessage(err,"Erreur lors de la création"));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-neutral-900 p-6">
            <h3 className="text-xl font-semibold">Créer un salon</h3>

            {error && (
                <div className="rounded-lg bg-red-500/15 px-4 py-3 text-red-300">
                    {error}
                </div>
            )}

            <div>
                <label className="mb-1 block text-sm text-white/80">Nom</label>
                <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-neutral-800 px-4 py-3"
                    required
                />
            </div>

            <div>
                <label className="mb-1 block text-sm text-white/80">Description</label>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="min-h-[100px] w-full rounded-lg border border-white/10 bg-neutral-800 px-4 py-3"
                />
            </div>

            <div>
                <label className="mb-1 block text-sm text-white/80">Visibilité</label>
                <select
                    name="visibility"
                    value={form.visibility}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-neutral-800 px-4 py-3"
                >
                    <option value="PUBLIC">PUBLIC</option>
                    <option value="PRIVATE">PRIVATE</option>
                </select>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-fuchsia-500 px-4 py-3 font-semibold hover:bg-fuchsia-600 disabled:opacity-60"
            >
                {isSubmitting ? "Création..." : "Créer le salon"}
            </button>
        </form>
    );
}
