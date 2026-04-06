import { Link, Navigate } from "react-router-dom";
import { LoginForm } from "../features/auth/LoginForm";
import { useAuth } from "../features/auth/AuthContext";

export default function LoginPage() {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <section className="mx-auto max-w-md">
            <LoginForm />
            <p className="mt-4 text-center text-white/70">
                Pas encore de compte ?{" "}
                <Link to="/register" className="text-fuchsia-400 hover:underline">
                    S’inscrire
                </Link>
            </p>
        </section>
    );
}