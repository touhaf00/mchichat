import {type ChangeEvent, type FormEvent, useState} from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "./auth.api";
import { useAuth } from "./useAuth";
import {getApiErrorMessage} from "../../lib/getApiErrorMessage.ts";

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
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const data = await loginRequest(form);
            await login(data.token, data.user);
            navigate("/dashboard");
        } catch (err: unknown) {
            setError(getApiErrorMessage (err,"Erreur de connexion"));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-neutral-900 p-6">
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
                    className="w-full rounded-lg border border-white/10 bg-neutral-800 px-4 py-3 outline-none"
                    required
                />
            </div>

            <div>
                <label className="mb-1 block text-sm text-white/80">Mot de passe</label>
                <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-neutral-800 px-4 py-3 outline-none"
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