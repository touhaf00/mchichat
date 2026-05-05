import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";

export function AppLayout() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <header className="border-b border-white/10 bg-neutral-900">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <Link to="/" className="text-2xl font-bold text-fuchsia-400">
                        Mchichat
                    </Link>

                    <nav className="flex items-center gap-4 text-sm">
                        <NavLink to="/" className="hover:text-fuchsia-300">
                            Accueil
                        </NavLink>

                        {isAuthenticated ? (
                            <>
                                <NavLink to="/dashboard" className="hover:text-fuchsia-300">
                                    Dashboard
                                </NavLink>
                                <NavLink to="/profile" className="hover:text-fuchsia-300">
                                    Profil
                                </NavLink>
                                <span className="text-white/70">
                  {user?.firstName} {user?.lastName}
                </span>
                                <button
                                    onClick={handleLogout}
                                    className="rounded-lg bg-red-500 px-4 py-2 font-medium hover:bg-red-600"
                                >
                                    Déconnexion
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" className="hover:text-fuchsia-300">
                                    Connexion
                                </NavLink>
                                <NavLink to="/register" className="hover:text-fuchsia-300">
                                    Inscription
                                </NavLink>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-8">
                <Outlet />
            </main>
        </div>
    );
}