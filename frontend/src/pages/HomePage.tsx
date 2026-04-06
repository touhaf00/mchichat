import { Link } from "react-router-dom";

export default function HomePage() {
    return (
        <section className="flex min-h-[70vh] flex-col items-center justify-center text-center">
            <h1 className="text-5xl font-extrabold text-fuchsia-400">Mchichat</h1>
            <p className="mt-4 max-w-2xl text-lg text-white/70">
                Une application de chat moderne avec authentification JWT, salons et backend RESTful.
            </p>

            <div className="mt-8 flex gap-4">
                <Link
                    to="/register"
                    className="rounded-xl bg-fuchsia-500 px-6 py-3 font-semibold hover:bg-fuchsia-600"
                >
                    Commencer
                </Link>

                <Link
                    to="/login"
                    className="rounded-xl border border-white/15 px-6 py-3 font-semibold hover:bg-white/5"
                >
                    Connexion
                </Link>
            </div>
        </section>
    );
}