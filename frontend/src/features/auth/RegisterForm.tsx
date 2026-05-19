import { type ChangeEvent, type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerRequest } from "./auth.api";
import { useAuth } from "./useAuth";
import { getApiErrorMessage } from "../../lib/getApiErrorMessage.ts";

function getRegisterErrorMessage(error: unknown) {
    const message = getApiErrorMessage(
        error,
        "Impossible de créer le compte"
    );

    if (
        message.toLowerCase().includes("email") ||
        message.toLowerCase().includes("username") ||
        message.toLowerCase().includes("utilisé") ||
        message.toLowerCase().includes("mot de passe") ||
        message.toLowerCase().includes("prénom") ||
        message.toLowerCase().includes("nom")
    ) {
        return message;
    }

    if (
        message.toLowerCase().includes("network") ||
        message.toLowerCase().includes("réseau")
    ) {
        return "Impossible de contacter le serveur. Vérifie que le backend est lancé.";
    }

    return "Impossible de créer le compte. Vérifie les informations saisies.";
}

export function RegisterForm() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        email: "",
        username: "",
        password: "",
        firstName: "",
        lastName: "",
    });

    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        setForm((prev) => ({
            ...prev,
            [event.target.name]: event.target.value,
        }));

        setError("");
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!form.firstName.trim()) {
            setError("Le prénom est obligatoire.");
            return;
        }

        if (!form.lastName.trim()) {
            setError("Le nom est obligatoire.");
            return;
        }

        if (!form.username.trim()) {
            setError("Le username est obligatoire.");
            return;
        }

        if (!form.email.trim()) {
            setError("L'adresse email est obligatoire.");
            return;
        }

        if (form.password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }

        setIsSubmitting(true);

        try {
            const data = await registerRequest({
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                username: form.username.trim(),
                email: form.email.trim(),
                password: form.password,
            });

            await login(data.token, data.user);
            navigate("/");
        } catch (err: unknown) {
            setError(getRegisterErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-white/10 bg-neutral-900 p-6"
        >
            <h2 className="text-2xl font-bold">Inscription</h2>

            {error && (
                <div className="rounded-lg bg-red-500/15 px-4 py-3 text-red-300">
                    {error}
                </div>
            )}

            <div>
                <label className="mb-1 block text-sm text-white/80">Prénom</label>
                <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-neutral-800 px-4 py-3 outline-none focus:border-fuchsia-400"
                    required
                />
            </div>

            <div>
                <label className="mb-1 block text-sm text-white/80">Nom</label>
                <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-neutral-800 px-4 py-3 outline-none focus:border-fuchsia-400"
                    required
                />
            </div>

            <div>
                <label className="mb-1 block text-sm text-white/80">Username</label>
                <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-neutral-800 px-4 py-3 outline-none focus:border-fuchsia-400"
                    required
                />
            </div>

            <div>
                <label className="mb-1 block text-sm text-white/80">Email</label>
                <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-neutral-800 px-4 py-3 outline-none focus:border-fuchsia-400"
                    required
                />
            </div>

            <div>
                <label className="mb-1 block text-sm text-white/80">
                    Mot de passe
                </label>
                <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-neutral-800 px-4 py-3 outline-none focus:border-fuchsia-400"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-fuchsia-500 px-4 py-3 font-semibold hover:bg-fuchsia-600 disabled:opacity-60"
            >
                {isSubmitting ? "Inscription..." : "Créer un compte"}
            </button>
        </form>
    );
}