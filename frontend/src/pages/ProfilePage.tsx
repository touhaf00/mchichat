import { useAuth } from "../features/auth/AuthContext";

export default function ProfilePage() {
    const { user } = useAuth();

    if (!user) {
        return <div>Utilisateur introuvable.</div>;
    }

    return (
        <section className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-neutral-900 p-6">
            <h1 className="mb-6 text-3xl font-bold">Mon profil</h1>

            <div className="grid gap-4">
                <div>
                    <p className="text-sm text-white/50">Prénom</p>
                    <p className="text-lg">{user.firstName}</p>
                </div>

                <div>
                    <p className="text-sm text-white/50">Nom</p>
                    <p className="text-lg">{user.lastName}</p>
                </div>

                <div>
                    <p className="text-sm text-white/50">Username</p>
                    <p className="text-lg">{user.username}</p>
                </div>

                <div>
                    <p className="text-sm text-white/50">Email</p>
                    <p className="text-lg">{user.email}</p>
                </div>

                <div>
                    <p className="text-sm text-white/50">Rôle</p>
                    <p className="text-lg">{user.role}</p>
                </div>
            </div>
        </section>
    );
}