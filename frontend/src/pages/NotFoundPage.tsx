import { Link } from "react-router-dom";

export default function NotFoundPage() {
    return (
        <section className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <h1 className="text-6xl font-bold text-fuchsia-400">404</h1>
            <p className="mt-4 text-white/70">Page introuvable.</p>
            <Link
                to="/"
                className="mt-6 rounded-xl bg-fuchsia-500 px-6 py-3 font-semibold hover:bg-fuchsia-600"
            >
                Retour à l’accueil
            </Link>
        </section>
    );
}