import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";
import { SocketNotifications } from "../../features/notifications/SocketNotifications";
import { useNotifications } from "../../features/notifications/NotificationProvider";
import { socket } from "../../lib/socket";

function NotificationBadge({ count }: { count: number }) {
    if (count <= 0) return null;

    return (
        <span className="ml-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
            {count > 99 ? "99+" : count}
        </span>
    );
}

export function AppLayout() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const {
        counts,
        totalSalons,
        totalMessages,
        resetFriends,
    } = useNotifications();

    function handleLogout() {
        socket.disconnect();
        logout();
        navigate("/login");
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            {isAuthenticated && <SocketNotifications />}

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
                                    <NotificationBadge count={totalSalons} />
                                </NavLink>

                                <NavLink to="/profile" className="hover:text-fuchsia-300">
                                    Profil
                                </NavLink>

                                <NavLink
                                    to="/friends"
                                    onClick={resetFriends}
                                    className="hover:text-fuchsia-300"
                                >
                                    Amis
                                    <NotificationBadge count={counts.friends} />
                                </NavLink>

                                <NavLink to="/messages" className="hover:text-fuchsia-300">
                                    Messages
                                    <NotificationBadge count={totalMessages} />
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