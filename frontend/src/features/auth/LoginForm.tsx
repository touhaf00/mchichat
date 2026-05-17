import { type ChangeEvent, type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "./auth.api";
import { useAuth } from "./useAuth";
import { getApiErrorMessage } from "../../lib/getApiErrorMessage.ts";

function getLoginErrorMessage(error: unknown) {
    const message = getApiErrorMessage(
        error,
        "Email ou mot de passe incorrect"
    );

    if (
        message.toLowerCase().includes("mot de passe") ||
        message.toLowerCase().includes("email")
    ) {
        return message.replace("invalide", "incorrect");
    }

    if (
        message.toLowerCase().includes("network") ||
        message.toLowerCase().includes("réseau")
    ) {
        return "Impossible de contacter le serveur. Vérifie que le backend est lancé.";
    }

    return "Email ou mot de passe incorrect";
}

export function LoginForm() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: "",
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

        if (!form.email.trim()) {
            setError("L'adresse email est obligatoire.");
            return;
        }

        if (!form.password.trim()) {
            setError("Le mot de passe est obligatoire.");
            return;
        }

        setIsSubmitting(true);

        try {
            const data = await loginRequest({
                email: form.email.trim(),
                password: form.password,
            });

            await login(data.token, data.user);
            navigate("/dashboard");
        } catch (err: unknown) {
            setError(getLoginErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-white/10 bg-neutral-900 p-6"
        >
            <h2 className="text-2xl font-bold">Connexion</h2>

            {error && (
                <div className="rounded-lg bg-red-500/15 px-4 py-3 text-red-300">
                    {error}
                </div>
            )}

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
                {isSubmitting ? "Connexion..." : "Se connecter"}
            </button>
        </form>
    );
}