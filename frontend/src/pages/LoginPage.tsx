import { Link, Navigate } from "react-router-dom";
import { LoginForm } from "../features/auth/LoginForm";
import { useAuth } from "../features/auth/useAuth";

export default function LoginPage() {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <section className="mx-auto max-w-md">
            <img
                src="/logo.png"
                alt="Mchichat"
                className="mx-auto mb-6 h-24 w-24 object-contain"
            />
            <LoginForm/>
            <p className="mt-4 text-center text-white/70">
                Pas encore de compte ?{" "}
                <Link to="/register" className="text-fuchsia-400 hover:underline">
                    S’inscrire
                </Link>
            </p>
        </section>
    );
}