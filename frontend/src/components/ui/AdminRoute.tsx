import { Navigate } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";
import type {JSX} from "react";

type AdminRouteProps = {
    children: JSX.Element;
};

export function AdminRoute({ children }: AdminRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center text-white/70">
                Chargement...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== "ADMIN") {
        return <Navigate to="/" replace />;
    }

    return children;
}