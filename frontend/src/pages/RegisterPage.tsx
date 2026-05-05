import { Link, Navigate } from "react-router-dom";
import { RegisterForm } from "../features/auth/RegisterForm";
import { useAuth } from "../features/auth/useAuth";

export default function RegisterPage() {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <section className="mx-auto max-w-md">
            <RegisterForm />
            <p className="mt-4 text-center text-white/70">
                Déjà un compte ?{" "}
                <Link to="/login" className="text-fuchsia-400 hover:underline">
                    Se connecter
                </Link>
            </p>
        </section>
    );
}